package __PACKAGE__;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Đăng ký plugin nhận/chọn tệp của WPScraft (phải gọi trước super.onCreate).
        registerPlugin(WpsFilePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
