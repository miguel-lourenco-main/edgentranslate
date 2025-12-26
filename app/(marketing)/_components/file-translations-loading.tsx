function FileTranslationsExamplesLoading() {
    return (
      <div className="relative w-[100rem] h-[43rem] bg-background border rounded-lg shadow-sm">
        <div className="flex items-center border-b overflow-x-auto">
          {/* Placeholder tabs */}
          {[1, 2, 3, 4].map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 border-r animate-pulse"
            >
              <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
              <div className="h-4 w-20 bg-muted-foreground/20 rounded" />
            </div>
          ))}
        </div>
        
        <div className="flex flex-col size-full justify-center items-center p-4">
          <div className="grid md:grid-cols-2 gap-4 w-full h-full">
            {/* Left panel */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2 animate-pulse">
                <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
                <div className="h-4 w-32 bg-muted-foreground/20 rounded" />
              </div>
              <div className="aspect-[4/3] rounded-lg border bg-zinc-50 dark:bg-zinc-900 animate-pulse" />
            </div>
  
            {/* Right panel */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2 animate-pulse">
                <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
                <div className="h-4 w-32 bg-muted-foreground/20 rounded" />
              </div>
              <div className="aspect-[4/3] rounded-lg border bg-zinc-50 dark:bg-zinc-900 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default FileTranslationsExamplesLoading;