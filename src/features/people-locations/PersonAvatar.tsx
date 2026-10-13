export interface PersonAvatarProps {
  src: string;
  name: string;
}

// people.json stores paths relative to the site root ("assets/people/x.png").
// Under /react/team/... a relative path would resolve to the wrong folder,
// so make it absolute.
function toAbsolute(src: string): string {
  return src.startsWith("/") || src.startsWith("http") ? src : `/${src}`;
}

export function PersonAvatar({ src, name }: PersonAvatarProps) {
  return <img className="person-avatar" src={toAbsolute(src)} alt={`Portrait of ${name}`} />;
}
