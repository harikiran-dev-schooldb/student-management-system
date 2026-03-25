package com.schooldb.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

// 🔥 ADD THESE IMPORTS
import com.google.firebase.messaging.FirebaseMessaging;
import android.util.Log;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Disable edge-to-edge drawing
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        // 🔥 ADD THIS BLOCK (VERY IMPORTANT)
        FirebaseMessaging.getInstance().getToken()
            .addOnCompleteListener(task -> {
                if (!task.isSuccessful()) {
                    Log.w("FCM_TOKEN", "Fetching FCM token failed", task.getException());
                    return;
                }

                String token = task.getResult();
                Log.d("🔥 FCM_TOKEN", token);
            });
    }
}