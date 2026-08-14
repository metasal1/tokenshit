/**
 * Digital Asset Links for TWA / Seeker (Android).
 * GET /.well-known/assetlinks.json
 *
 * After first keystore + APK, replace REPLACE_AFTER_KEYSTORE_BUILD with:
 *   keytool -list -v -keystore dapp-store/android.keystore | grep SHA256
 * Then redeploy so Bubblewrap validation + install association succeed.
 */
export const dynamic = "force-static";

const BODY = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.tokenshit.app",
      sha256_cert_fingerprints: ["REPLACE_AFTER_KEYSTORE_BUILD"],
    },
  },
];

export function GET() {
  return Response.json(BODY, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
