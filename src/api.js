const BASE = "";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, options);
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.detail) detail = data.detail;
    } catch {
      /* keep default */
    }
    throw new Error(detail);
  }
  return res.json();
}

const jsonHeaders = { "Content-Type": "application/json" };

export const api = {
  // Sources
  listSources: () => request("/sources"),
  uploadSource: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/sources/upload", { method: "POST", body: form });
  },

  // Groups
  listGroups: () => request("/groups"),
  createGroup: (payload) =>
    request("/groups", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    }),
  deleteGroup: (groupId) =>
    request(`/groups/${groupId}`, { method: "DELETE" }),
  groupSources: (groupId) => request(`/groups/${groupId}/sources`),
  addSourceToGroup: (groupId, sourceId) =>
    request(`/groups/${groupId}/sources`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ source_id: sourceId }),
    }),
  removeSourceFromGroup: (groupId, sourceId) =>
    request(`/groups/${groupId}/sources/${sourceId}`, {
      method: "DELETE",
    }),

  // Chat
  chat: (payload) =>
    request("/chat", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    }),
};
