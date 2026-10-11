/**
 * Running border light ("beam") of a card or button. Looks exactly like the old ::before light (same colours,
 * thickness, speed and starting point), but the light is now turned by the graphics chip (a rotating layer behind
 * a ring mask) instead of being repainted by the processor on every frame. Before, every visible card's
 * whole area (photo included) was redrawn ~60 times a second just for this thin light, which made phones stutter.
 * Styling lives in globals.css (".beam"); the parent's class decides size, colours and speed.
 */
export function Beam() {
  return (
    <span className="beam" aria-hidden="true">
      <span className="beam__ray" />
    </span>
  );
}
