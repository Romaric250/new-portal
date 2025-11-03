export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to New Portal
        </h1>
        <p className="text-center text-muted-foreground">
          Enterprise Next.js Application with Prisma, MongoDB, Better Auth, and
          Redis
        </p>
      </div>
    </main>
  );
}

