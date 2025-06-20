export function extractPublicIdFromUrl(url: string): string | null {
    const match = url.match(/\/vehicles\/([^\.]+)/); // gets value like vehicles/abc123
    return match ? `vehicles/${match[1]}` : null;
  }
  