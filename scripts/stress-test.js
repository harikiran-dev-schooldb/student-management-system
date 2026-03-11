import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 100,
  duration: "30s",
};

const params = {
  headers: {
    Cookie: "__session-token=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18ycDV0dHVxV2pRVFJrNU02OFJZTmFlaE5TWjMiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJleHAiOjE3NzMxNTAyOTUsImZ2YSI6WzExMjcxLC0xXSwiaWF0IjoxNzczMTUwMjM1LCJpc3MiOiJodHRwczovL3ZvY2FsLWRvZS00Ny5jbGVyay5hY2NvdW50cy5kZXYiLCJqdGkiOiI3MmNmNWQ1YjY1MzYyOTY1YzlmYiIsIm5iZiI6MTc3MzE1MDIyNSwicm9sZSI6ImFkbWluIiwic2lkIjoic2Vzc18zQU9xTzFqb0RGNlpnUUFJZkJoRjR6RnR6SVIiLCJzdHMiOiJhY3RpdmUiLCJzdWIiOiJ1c2VyXzM0aERRVU11SG9QdHZhV01Xc3JuWWFBWXp0dSJ9.kuSr35FjUfso1S7sNLlGOtxzA0AOqSORAxfjI4_us8dBMSLYc6HAGlMDGMIFWSsRxBh7voh7Ro_LVY6t9mWJTAm79jbCGhi6Qv50FLAgWfU-3usaNf_ffvgmJ9j-W_9Q7QBBrngdj7YD7dWMz0ZwhrZZ8aOtc-HCWYx92UlSJoA-pwsFRB4zrM2goxLUdjCbQXBc1FwK4XEAUKgD0T7iSHIDrLXSeXQnLPUeuFX6smhDuTzCeakEbhi2SRwtdj8aGyT460bI0I0HfWcDqdVVdngywqRDVTW4UugggCGK_6snqvxQNMEx7R8tUc9oj36tcHJurpLntDjAEnynmtsaQw"
  }
};

export default function () {

  http.get("http://localhost:3000/api/v1/tenants/test/classes", params);

  sleep(1);
}