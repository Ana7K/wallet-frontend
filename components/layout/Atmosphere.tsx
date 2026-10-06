export default function Atmosphere() {
  return (
    <div className="atmos" aria-hidden="true">
      <div className="orb animate-float -left-24 -top-32 h-[28rem] w-[28rem]" style={{ background: "rgb(var(--orb1))" }} />
      <div className="orb animate-float right-[-8rem] top-1/4 h-[26rem] w-[26rem]" style={{ background: "rgb(var(--orb2))", animationDelay: "-8s" }} />
      <div className="orb animate-float bottom-[-10rem] left-1/3 h-[24rem] w-[24rem]" style={{ background: "rgb(var(--orb3))", animationDelay: "-15s", opacity: "calc(var(--orb-o) * .6)" }} />
    </div>
  );
}
