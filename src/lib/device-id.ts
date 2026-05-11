export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("tokenshit_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("tokenshit_device_id", id);
  }
  return id;
}

export function getAnonVoteCount(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem("tokenshit_anon_votes") || 0);
}

export function incrementAnonVoteCount(): number {
  const count = getAnonVoteCount() + 1;
  localStorage.setItem("tokenshit_anon_votes", String(count));
  return count;
}
