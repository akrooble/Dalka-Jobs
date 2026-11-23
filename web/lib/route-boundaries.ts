// Validate dynamic workspace routes before a loading boundary can stream 200.
// The page modules still enforce these same route inventories and role guards.
const admin = new Set(["overview","jobs","companies","recruitment","users","assignments","lists","trust","reports","content","invoices","payments","prices","summary","settings","activity","job-editor","candidate","invoice-editor","invoice-detail","sign-in"]);
const account = new Set(["overview","profile","applications","application-detail","notifications","apply","sign-in"]);
const company = new Set(["jobs","candidates","rejected","progress"]);
const recruiter = new Set(["jobs","candidates","interviews","candidate"]);
export function knownWorkspacePath(path: string) {
  if (path === "/admin" || path === "/account") return true;
  const parts = path.split("/");
  if (parts.length === 3 && parts[1] === "admin") return admin.has(parts[2]);
  if (parts.length === 3 && parts[1] === "account") return account.has(parts[2]);
  if (parts.length === 4 && parts[1] === "workspace") return parts[2] === "company" ? company.has(parts[3]) : parts[2] === "recruiter" && recruiter.has(parts[3]);
  return false;
}
