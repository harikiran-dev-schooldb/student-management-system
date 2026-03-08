import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 100,
  duration: "30s",
};

const params = {
  headers: {
    Cookie: "__session-token=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18ycDV0dHVxV2pRVFJrNU02OFJZTmFlaE5TWjMiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJleHAiOjE3NzI5MzgzODYsImZ2YSI6WzgwNTgsLTFdLCJpYXQiOjE3NzI5MzgzMjYsImlzcyI6Imh0dHBzOi8vdm9jYWwtZG9lLTQ3LmNsZXJrLmFjY291bnRzLmRldiIsImp0aSI6IjhlMzg4Yzk4MjUxNTRjNzhjNWZhIiwibmJmIjoxNzcyOTM4MzE2LCJyb2xlIjoiYWRtaW4iLCJzaWQiOiJzZXNzXzNBT0RncU5VMWZFRklkU2pmRkM4cGpxSTVpUyIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzRoRFFVTXVIb1B0dmFXTVdzcm5ZYUFZenR1In0.X3Uku2CkBRkcOuA8yqW1ThEChDCVnlJkOc0w-trHtIxjdDIOUbN36ClY5nwrDYLsvFZYfzzK3IEWKKO1uFDaDQorZNr7xIw7GF7IG1fiKV-ocOsCd5Fp00sJuVra9i9pluYVhnNmsrcu7KjeP6c35U8toTJ8DXTZBqlAApejNNOh8jgXUDySfaWSp5Z-2g5i1T2b7ZAuaF7nc_F2fJa9qZQdjW_nN7rTfBVK4Ra9BUeT3EtaYf7gnWLq7OhoLpT-rJyQa8J7DQGKUfiEDF10Zyh8EIgOvIWRsZ4fVgnSu5poycr_ZmcNfReurqPXsEC6ByTLeWCif4cd7HQU7inGPg"
  }
};

export default function () {

  http.get("http://localhost:3000/api/v1/tenants/test/classes", params);

  sleep(1);
}