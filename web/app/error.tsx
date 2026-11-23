"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="container state-page"><span className="eyebrow">Dalka Jobs</span><h1>Something didn’t load.</h1><p>We couldn’t display this page. Please try again.</p><button className="button button-primary" type="button" onClick={reset}>Try again</button></main>;
}
