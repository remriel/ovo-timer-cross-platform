package com.remriel.ovotimer;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(OvoAlarmPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
