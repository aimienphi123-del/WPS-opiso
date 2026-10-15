package __PACKAGE__;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Parcelable;
import android.provider.OpenableColumns;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;

/**
 * Plugin của WPScraft:
 *  - pickFile(): mở bộ chọn tệp của Android, chép tệp vào thư viện riêng của app.
 *  - Nhận tệp khi người dùng bấm "Mở bằng" / "Chia sẻ" từ app khác (sự kiện fileOpened / fileError).
 *  - exists(), removeFile(): kiểm tra / xóa tệp trong thư viện của app.
 * Tệp từ Android thường có địa chỉ content://, WebView không đọc trực tiếp được nên phải chép ra tệp thật.
 */
@CapacitorPlugin(name = "WpsFile")
public class WpsFilePlugin extends Plugin {

    private static final String CONSUMED = "wps_consumed";

    @Override
    public void load() {
        // Trường hợp app chưa chạy mà người dùng bấm mở tệp bằng WPScraft.
        if (getActivity() != null) {
            handleIntent(getActivity().getIntent());
        }
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        // Trường hợp app đang chạy.
        handleIntent(intent);
    }

    private File libraryDir() {
        File dir = new File(getContext().getFilesDir(), "library");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return dir;
    }

    private void handleIntent(Intent intent) {
        if (intent == null || intent.getBooleanExtra(CONSUMED, false)) return;
        if ((intent.getFlags() & Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY) != 0) return;

        String action = intent.getAction();
        Uri uri = null;
        String sharedText = null;
        if (Intent.ACTION_VIEW.equals(action)) {
            uri = intent.getData();
        } else if (Intent.ACTION_SEND.equals(action)) {
            uri = getStreamExtra(intent);
            if (uri == null) {
                sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
            }
        } else {
            return;
        }
        if (uri == null && (sharedText == null || sharedText.isEmpty())) return;

        intent.putExtra(CONSUMED, true);
        final Uri fileUri = uri;
        final String text = sharedText;
        final String mime = intent.getType();
        new Thread(() -> {
            try {
                JSObject info = (fileUri != null) ? copyUri(fileUri, mime) : saveText(text);
                emit("fileOpened", info);
            } catch (Exception e) {
                JSObject err = new JSObject();
                err.put("message", "Không nhận được tệp từ ứng dụng khác (" + e.getMessage()
                        + "). Hãy thử mở tệp bằng nút \"Mở tài liệu\" trong WPScraft.");
                emit("fileError", err);
            }
        }).start();
    }

    private void emit(String event, JSObject data) {
        Activity a = getActivity();
        if (a == null) {
            notifyListeners(event, data, true);
        } else {
            a.runOnUiThread(() -> notifyListeners(event, data, true));
        }
    }

    @SuppressWarnings("deprecation")
    private Uri getStreamExtra(Intent intent) {
        if (Build.VERSION.SDK_INT >= 33) {
            return intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri.class);
        }
        Parcelable p = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        return (p instanceof Uri) ? (Uri) p : null;
    }

    @PluginMethod
    public void pickFile(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        startActivityForResult(call, intent, "pickFileResult");
    }

    @ActivityCallback
    private void pickFileResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Intent data = result.getData();
        if (result.getResultCode() != Activity.RESULT_OK || data == null || data.getData() == null) {
            JSObject cancelled = new JSObject();
            cancelled.put("cancelled", true);
            call.resolve(cancelled);
            return;
        }
        final Uri uri = data.getData();
        new Thread(() -> {
            try {
                call.resolve(copyUri(uri, getContext().getContentResolver().getType(uri)));
            } catch (Exception e) {
                call.reject("Không nạp được tệp đã chọn: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void exists(PluginCall call) {
        String path = call.getString("path");
        JSObject r = new JSObject();
        File f = insideLibrary(path);
        r.put("exists", f != null && f.isFile());
        call.resolve(r);
    }

    @PluginMethod
    public void removeFile(PluginCall call) {
        String path = call.getString("path");
        File f = insideLibrary(path);
        JSObject r = new JSObject();
        r.put("deleted", f != null && f.isFile() && f.delete());
        call.resolve(r);
    }

    /** Chỉ cho phép thao tác với tệp nằm trong thư viện của app. */
    private File insideLibrary(String path) {
        if (path == null || path.isEmpty()) return null;
        try {
            File f = new File(path).getCanonicalFile();
            String dir = libraryDir().getCanonicalPath() + File.separator;
            return f.getPath().startsWith(dir) ? f : null;
        } catch (IOException e) {
            return null;
        }
    }

    private String queryName(Uri uri) {
        String name = null;
        if ("content".equals(uri.getScheme())) {
            try (Cursor c = getContext().getContentResolver()
                    .query(uri, new String[] {OpenableColumns.DISPLAY_NAME}, null, null, null)) {
                if (c != null && c.moveToFirst()) {
                    name = c.getString(0);
                }
            } catch (Exception ignored) {
                // dùng tên dự phòng bên dưới
            }
        }
        if (name == null || name.isEmpty()) {
            name = uri.getLastPathSegment();
        }
        if (name == null || name.isEmpty()) {
            name = "tai-lieu";
        }
        return name;
    }

    /** Tên tệp trên đĩa chỉ gồm ký tự ASCII để tránh lỗi đường dẫn; tên hiển thị vẫn giữ nguyên tiếng Việt. */
    private String diskName(String name) {
        String s = name.replace('đ', 'd').replace('Đ', 'D');
        s = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
        s = s.replaceAll("[^A-Za-z0-9._-]", "_");
        if (s.length() > 100) {
            int dot = s.lastIndexOf('.');
            String ext = (dot > 0 && s.length() - dot <= 10) ? s.substring(dot) : "";
            s = s.substring(0, 100 - ext.length()) + ext;
        }
        return s.isEmpty() ? "tai-lieu" : s;
    }

    private JSObject copyUri(Uri uri, String mime) throws IOException {
        Context ctx = getContext();
        String name = queryName(uri);
        File out = new File(libraryDir(), System.currentTimeMillis() + "_" + diskName(name));
        long total = 0;
        try (InputStream in = ctx.getContentResolver().openInputStream(uri);
                OutputStream os = new FileOutputStream(out)) {
            if (in == null) {
                throw new IOException("không mở được luồng dữ liệu");
            }
            byte[] buf = new byte[64 * 1024];
            int n;
            while ((n = in.read(buf)) != -1) {
                os.write(buf, 0, n);
                total += n;
            }
        } catch (IOException | RuntimeException e) {
            out.delete();
            throw e;
        }
        return info(out, name, total, mime);
    }

    private JSObject saveText(String text) throws IOException {
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        File out = new File(libraryDir(), System.currentTimeMillis() + "_van-ban-chia-se.txt");
        try (OutputStream os = new FileOutputStream(out)) {
            os.write(bytes);
        } catch (IOException e) {
            out.delete();
            throw e;
        }
        return info(out, "Văn bản chia sẻ.txt", bytes.length, "text/plain");
    }

    private JSObject info(File f, String name, long size, String mime) {
        JSObject r = new JSObject();
        r.put("path", f.getAbsolutePath());
        r.put("name", name);
        r.put("size", size);
        r.put("mime", mime == null ? "" : mime);
        return r;
    }
}
