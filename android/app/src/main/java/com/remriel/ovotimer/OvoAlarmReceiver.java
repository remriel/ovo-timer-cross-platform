package com.remriel.ovotimer;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class OvoAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!OvoAlarmScheduler.ACTION_FIRE.equals(intent.getAction())) {
            return;
        }

        String title = intent.getStringExtra(OvoAlarmScheduler.EXTRA_TITLE);
        String body = intent.getStringExtra(OvoAlarmScheduler.EXTRA_BODY);
        OvoAlarmScheduler.startAlarm(context, title, body);
    }
}
