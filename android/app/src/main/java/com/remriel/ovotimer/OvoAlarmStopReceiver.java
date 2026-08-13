package com.remriel.ovotimer;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class OvoAlarmStopReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (OvoAlarmScheduler.ACTION_STOP.equals(intent.getAction())) {
            OvoAlarmScheduler.stopAlarm(context);
        }
    }
}
