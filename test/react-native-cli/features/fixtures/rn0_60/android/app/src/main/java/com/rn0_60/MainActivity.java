package com.rn0_60;

import android.os.Bundle;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "rn0_60";
    }

    @Override
    protected void onSaveInstanceState(Bundle SavedInstanceState) {
        // Do not write any state, to avoid crashes on relaunch after a crash.  If Android keeps the state Bundle from
        // before the crash, passing it back into the application it can do so with a Drawable that does not implement
        // the getConstantState method, causing another crash.
    }
}
