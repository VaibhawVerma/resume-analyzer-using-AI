import React, { useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";

export default function Wipe() {
    const [confirm, setConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fs = usePuterStore((s) => s.fs);
    const kv = usePuterStore((s) => s.kv);

    const handleWipe = async () => {
        setDeleting(true);
        setError(null);
        try {
            // Delete all files in root directory, ignore not found
            const files = (await fs.readDir("/")) ?? [];
            await Promise.all(
              files.map(async (file: any) => {
                  try {
                      if (file.path) await fs.delete(file.path);
                  } catch (e: any) {
                      if (
                        !(
                          e?.message?.toLowerCase().includes("not found") ||
                          e?.message?.toLowerCase().includes("does not exist")
                        )
                      ) {
                          throw e;
                      }
                  }
              })
            );

            // Delete all resume keys from KV store, ignoring not found errors
            const allKeys = (await kv.list("resume:*")) ?? [];
            let resumeKeys: string[] = [];
            if (allKeys.length && typeof allKeys[0] === "string") {
                resumeKeys = (allKeys as string[]).filter((k) =>
                  k.startsWith("resume:")
                );
            } else if (
              allKeys.length &&
              typeof allKeys[0] === "object" &&
              "key" in allKeys[0]
            ) {
                resumeKeys = (allKeys as { key: string }[])
                  .filter((item) => item.key.startsWith("resume:"))
                  .map((item) => item.key);
            }

            await Promise.all(
              resumeKeys.map(async (key) => {
                  try {
                      await kv.del(key);
                  } catch (e: any) {
                      if (
                        !(
                          e?.message?.toLowerCase().includes("not found") ||
                          e?.message?.toLowerCase().includes("does not exist")
                        )
                      ) {
                          throw e;
                      }
                  }
              })
            );

            setDone(true);
            setTimeout(() => navigate("/"), 2000);
        } catch (err: any) {
            setError("Failed to wipe data: " + (err?.message || err));
        } finally {
            setDeleting(false);
        }
    };

    if (done) {
        return (
          <div className="flex flex-col items-center justify-center h-96">
              <h2 className="text-xl font-bold text-green-600 mb-4">
                  All data deleted successfully!
              </h2>
              <p className="text-green-700">Redirecting to dashboard...</p>
          </div>
        );
    }

    return (
      <div className="flex flex-col items-center justify-center h-96">
          <h1 className="text-2xl font-bold mb-6 text-red-600">Delete All Data</h1>
          {error && <p className="mb-4 text-red-500">{error}</p>}
          {!confirm ? (
            <button
              onClick={() => setConfirm(true)}
              className="px-6 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition"
            >
                Begin Data Wipe
            </button>
          ) : (
            <div className="flex flex-col items-center">
                <p className="mb-4 text-red-700 text-lg font-semibold">
                    Are you sure? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                    <button
                      onClick={handleWipe}
                      className="px-6 py-2 bg-red-700 text-white rounded font-semibold hover:bg-red-800 transition"
                      disabled={deleting}
                    >
                        {deleting ? "Deleting..." : "Yes, delete everything"}
                    </button>
                    <button
                      onClick={() => setConfirm(false)}
                      className="px-6 py-2 border border-gray-400 rounded font-semibold hover:bg-gray-100 transition"
                      disabled={deleting}
                    >
                        Cancel
                    </button>
                </div>
            </div>
          )}
      </div>
    );
}
