package com.remriel.ovotimer;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.widget.Button;

public class OvoAlarmActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        keepAlarmVisibleOverTheLockScreen();
        setContentView(R.layout.activity_ovo_alarm);

        Button stopAlarm = findViewById(R.id.stop_alarm);
        stopAlarm.setOnClickListener(view -> {
            OvoAlarmScheduler.stopAlarm(this);
            finishAndRemoveTask();
        });
    }

    @Override
    public void onBackPressed() {
        // A ringing alarm is deliberately not dismissible with Back.
    }

    private void keepAlarmVisibleOverTheLockScreen() {
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        }
    }
}
