package com.remriel.ovotimer;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class OvoAlarmService extends Service {
    private static final long[] VIBRATION_PATTERN = { 0, 900, 250, 900, 250, 1400, 350 };

    private MediaPlayer mediaPlayer;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private Vibrator vibrator;
    private PowerManager.WakeLock wakeLock;
    private boolean alarmOutputStarted;

    @Override
    public void onCreate() {
        super.onCreate();
        createAlarmChannel();
        acquireWakeLock();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String title = intent == null ? null : intent.getStringExtra(OvoAlarmScheduler.EXTRA_TITLE);
        String body = intent == null ? null : intent.getStringExtra(OvoAlarmScheduler.EXTRA_BODY);
        startAsForegroundAlarm(title, body);

        if (!alarmOutputStarted) {
            alarmOutputStarted = true;
            startAlarmOutput();
        }

        return START_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        stopAlarmOutput();
        releaseWakeLock();
        super.onDestroy();
    }

    private void startAsForegroundAlarm(String title, String body) {
        Notification notification = buildAlarmNotification(
            title == null || title.isEmpty() ? "Ovo Timer" : title,
            body == null || body.isEmpty() ? "Time is up. Stop the alarm." : body
        );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                OvoAlarmScheduler.ALARM_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
            );
        } else {
            startForeground(OvoAlarmScheduler.ALARM_ID, notification);
        }
    }

    private void createAlarmChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        AudioAttributes attributes = alarmAudioAttributes();
        NotificationChannel channel = new NotificationChannel(
            OvoAlarmScheduler.CHANNEL_ID,
            "Ovo alarm — full screen",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Full-screen countdown alarms with sound and vibration.");
        channel.enableVibration(true);
        channel.setVibrationPattern(VIBRATION_PATTERN);
        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        channel.setSound(alarmSoundUri(), attributes);

        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        if (notificationManager != null) {
            if (notificationManager.isNotificationPolicyAccessGranted()) {
                channel.setBypassDnd(true);
            }
            notificationManager.createNotificationChannel(channel);
        }
    }

    private Notification buildAlarmNotification(String title, String body) {
        Intent fullScreenIntent = new Intent(this, OvoAlarmActivity.class)
            .setAction(OvoAlarmScheduler.ACTION_FIRE)
            .putExtra(OvoAlarmScheduler.EXTRA_TITLE, title)
            .putExtra(OvoAlarmScheduler.EXTRA_BODY, body)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
            this,
            OvoAlarmScheduler.ALARM_ID,
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, OvoAlarmScheduler.CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setColor(getColor(R.color.ovo_alarm_yellow))
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setAutoCancel(false)
            .setOnlyAlertOnce(true)
            .setContentIntent(fullScreenPendingIntent)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                "STOP ALARM",
                OvoAlarmScheduler.stopPendingIntent(this)
            )
            .build();
    }

    private void startAlarmOutput() {
        startAudio();
        startVibration();
    }

    private void startAudio() {
        try {
            audioManager = getSystemService(AudioManager.class);
            AudioAttributes attributes = alarmAudioAttributes();
            if (audioManager != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE)
                        .setAudioAttributes(attributes)
                        .setAcceptsDelayedFocusGain(false)
                        .setOnAudioFocusChangeListener(focusChange -> { })
                        .build();
                    audioManager.requestAudioFocus(audioFocusRequest);
                } else {
                    audioManager.requestAudioFocus(
                        focusChange -> { },
                        AudioManager.STREAM_ALARM,
                        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE
                    );
                }
            }

            AssetFileDescriptor alarmFile = getResources().openRawResourceFd(R.raw.ovo_alarm);
            if (alarmFile == null) {
                return;
            }

            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioAttributes(attributes);
            mediaPlayer.setDataSource(
                alarmFile.getFileDescriptor(),
                alarmFile.getStartOffset(),
                alarmFile.getLength()
            );
            alarmFile.close();
            mediaPlayer.setLooping(true);
            mediaPlayer.setVolume(1f, 1f);
            mediaPlayer.prepare();
            mediaPlayer.start();
        } catch (Exception ignored) {
            // The notification and full-screen alarm remain available if audio hardware is unavailable.
        }
    }

    private void startVibration() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vibratorManager = getSystemService(VibratorManager.class);
            vibrator = vibratorManager == null ? null : vibratorManager.getDefaultVibrator();
        } else {
            vibrator = getSystemService(Vibrator.class);
        }

        if (vibrator == null || !vibrator.hasVibrator()) {
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(VIBRATION_PATTERN, 0));
        } else {
            vibrator.vibrate(VIBRATION_PATTERN, 0);
        }
    }

    private void stopAlarmOutput() {
        if (vibrator != null) {
            vibrator.cancel();
            vibrator = null;
        }

        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
            } catch (IllegalStateException ignored) {
                // A partially initialized player can be released safely below.
            }
            mediaPlayer.release();
            mediaPlayer = null;
        }

        if (audioManager != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && audioFocusRequest != null) {
                audioManager.abandonAudioFocusRequest(audioFocusRequest);
            } else {
                audioManager.abandonAudioFocus(null);
            }
        }
        audioFocusRequest = null;
        audioManager = null;
    }

    private AudioAttributes alarmAudioAttributes() {
        return new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();
    }

    private Uri alarmSoundUri() {
        return Uri.parse(
            ContentResolver.SCHEME_ANDROID_RESOURCE
                + "://"
                + getPackageName()
                + "/"
                + R.raw.ovo_alarm
        );
    }

    private void acquireWakeLock() {
        PowerManager powerManager = getSystemService(PowerManager.class);
        if (powerManager == null) {
            return;
        }

        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "ovo:alarm");
        wakeLock.setReferenceCounted(false);
        wakeLock.acquire();
    }

    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        wakeLock = null;
    }
}
