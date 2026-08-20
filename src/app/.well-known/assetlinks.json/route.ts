/**
 * Digital Asset Links for TWA / Seeker (Android).
 * GET /.well-known/assetlinks.json
 */
export const dynamic = "force-static";

const BODY = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.tokenshit.app",
      sha256_cert_fingerprints: [
        "9E:A2:08:5F:1B:6E:91:F8:99:D3:1B:BC:90:58:86:5A:F7:17:C8:06:19:4D:24:76:D3:4D:82:06:B5:EA:04:F4",
      ],
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
