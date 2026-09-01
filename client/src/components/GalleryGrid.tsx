export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  tag: string;
  accent: string;
  emoji: string;
}

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <div className="gallery-grid">
      {items.map((item) => (
        <article className="gallery-card" key={item.id}>
          <div className="gallery-card__media" style={{ background: item.accent }}>
            <span>{item.emoji}</span>
          </div>
          <div className="gallery-card__body">
            <p className="gallery-card__tag">{item.tag}</p>
            <h3>{item.title}</h3>
            <p>{item.caption}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
