import Image from "next/image";

export function Loader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative flex size-16 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-accent/15 border-t-accent" />
        <Image
          src="/icon.png"
          alt="Loading"
          width={40}
          height={40}
          className="rounded-full object-cover"
          priority
        />
      </div>
    </div>
  );
}
