import {usePuterStore} from "~/lib/puter";
import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router";

export const meta = () => ([
    { title: 'Re:Match | Auth'},
    { name: 'description', content: 'Log into your account'}
])

const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const next = decodeURIComponent(searchParams.get("next") || "/");

    useEffect(() => {
        if (auth.isAuthenticated && !isLoading) {
            navigate(next, { replace: true }); // replace avoids leaving /auth in history
        }
    }, [auth.isAuthenticated, isLoading, navigate, next]);

    return (
      <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
          <div className="gradient-border shadow-lg">
              <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                  <div className="flex flex-col items-center justify-center">
                      <h1>Welcome</h1>
                      <h2>Log In to Continue</h2>
                  </div>
                  <div>
                      {isLoading ? (
                        <button className="auth-button animate-pulse">
                            Signing you in...
                        </button>
                      ) : (
                        <>
                            {auth.isAuthenticated ? (
                              <button className="auth-button" onClick={auth.signOut}>
                                  <p>Log Out</p>
                              </button>
                            ) : (
                              <button className="auth-button" onClick={auth.signIn}>
                                  <p>Log In</p>
                              </button>
                            )}
                        </>
                      )}
                  </div>
              </section>
          </div>
      </main>
    )
}

export default Auth
