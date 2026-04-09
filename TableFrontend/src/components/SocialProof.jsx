const reviews = [
  {
    name: "Rajesh Kumar",
    location: "Sharma Dhaba, Patna",
    avatar: "👨‍🍳",
    text: '"Pehle menu print karane mein hazaaron lagte the. Ab free mein digital menu mil gaya. Customers bhi zyada engage hote hain!"',
    className: "bg-primary text-white",
  },
  {
    name: "Priya Verma",
    location: "Phoenix Food Court, Patna",
    avatar: "👩‍💼",
    text: '"Managing 15 outlets was a nightmare. Now one QR code handles everything. The analytics showed us that biryani outsells everything 3-to-1."',
    className: "bg-warm text-ink",
  },
  {
    name: "Amit Gupta",
    location: "Gupta Sweets, Ranchi",
    avatar: "🧑‍🍳",
    text: '"Setup itna easy tha ki 10 minute mein ho gaya. Price update karna instant hai. I recommend this to every restaurant owner I know."',
    className: "bg-ink text-white",
  },
];

export default function SocialProof() {
  return (
    <section className="border-y border-black/10">
      <div className="mx-auto max-w-[1240px] px-5 py-20 lg:px-[52px]">
        <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          Real Owners, Real Words
        </div>
        <h2 className="font-display text-[clamp(30px,4vw,52px)] leading-[1.08] font-black tracking-[-1.5px] text-ink">
          They used to pay.
          <br />
          Now they <em className="italic">don&apos;t.</em>
        </h2>

        <div className="mt-13 grid gap-5 xl:grid-cols-3">
          {reviews.map((review) => {
            const dark = review.className.includes("text-white");
            return (
              <article
                key={review.name}
                className={`reveal rounded-[20px] border border-black/10 p-7 ${review.className}`}
              >
                <div
                  className={`mb-3.5 text-sm tracking-[3px] ${dark ? "text-white" : "text-primary"}`}
                >
                  ★★★★★
                </div>
                <p
                  className={`mb-5 text-sm leading-7 italic ${dark ? "text-white/80" : "text-ink"}`}
                >
                  {review.text}
                </p>
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex size-9 items-center justify-center rounded-full text-[17px] ${dark ? "bg-white/10" : "bg-paper"}`}
                  >
                    {review.avatar}
                  </div>
                  <div>
                    <div
                      className={`text-[13px] font-bold ${dark ? "text-white" : "text-ink"}`}
                    >
                      {review.name}
                    </div>
                    <div
                      className={`text-[11px] ${dark ? "text-white/50" : "text-muted"}`}
                    >
                      {review.location}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
