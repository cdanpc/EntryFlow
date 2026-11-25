export function eventPhoto(eventId: string) {
  if (eventId === "cebu-dev-meetup-2026") return "/images/events/meetup.jpg";
  if (eventId === "product-design-exchange") return "/images/events/workshop.jpg";
  return "/images/events/conference.jpg";
}
