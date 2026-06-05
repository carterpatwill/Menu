// PROTOTYPE — throwaway. Question: which login UI design feels most like Tappi?
// Delete or absorb once a variant is chosen. Visit /admin/login/proto?v=1|2|3
import { Suspense } from "react";
import LoginProto from "./LoginProto";

export default function ProtoPage() {
  return (
    <Suspense>
      <LoginProto />
    </Suspense>
  );
}
