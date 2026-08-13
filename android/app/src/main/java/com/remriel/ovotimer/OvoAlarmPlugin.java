package com.remriel.ovotimer;

import android.app.Activity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "OvoAlarm")
public class OvoAlarmPlugin extends Plugin {
    @PluginMethod
    public void schedule(PluginCall call) {
        Long triggerAt = call.getLong("at");
        if (triggerAt == null || triggerAt <= System.currentTimeMillis()) {
            call.reject("An alarm must be scheduled for a future time.");
            return;
        }

        String title = call.getString("title", "Ovo Timer");
        String body = call.getString("body", "Time is up. Stop the alarm.");
        boolean exact = OvoAlarmScheduler.schedule(getContext(), triggerAt, title, body);

        JSObject result = new JSObject();
        result.put("scheduled", true);
        result.put("exact", exact);
        result.put("fullScreen", OvoAlarmScheduler.canUseFullScreenIntent(getContext()));
        call.resolve(result);
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        OvoAlarmScheduler.cancel(getContext());
        call.resolve();
    }

    @PluginMethod
    public void fireNow(PluginCall call) {
        String title = call.getString("title", "Ovo Timer");
        String body = call.getString("body", "Time is up. Stop the alarm.");
        OvoAlarmScheduler.startAlarm(getContext(), title, body);
        call.resolve();
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("exactAlarm", OvoAlarmScheduler.canScheduleExactAlarms(getContext()));
        result.put("fullScreen", OvoAlarmScheduler.canUseFullScreenIntent(getContext()));
        result.put("doNotDisturb", OvoAlarmScheduler.canBypassDoNotDisturb(getContext()));
        result.put("notifications", OvoAlarmScheduler.canPostNotifications(getContext()));
        call.resolve(result);
    }

    @PluginMethod
    public void requestPriorityAccess(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Alarm priority settings are unavailable without an activity.");
            return;
        }

        JSObject result = new JSObject();
        result.put("opened", OvoAlarmScheduler.openNextPrioritySetting(activity));
        call.resolve(result);
    }
}
