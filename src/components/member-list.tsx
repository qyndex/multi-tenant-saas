import type { MemberWithProfile } from "@/types/database";

interface MemberListProps {
  members: MemberWithProfile[];
}

const roleBadgeColors: Record<string, string> = {
  owner: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  member: "bg-green-100 text-green-800",
  viewer: "bg-gray-100 text-gray-700",
};

/**
 * Displays a table of organization members with their profiles and roles.
 */
export function MemberList({ members }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-gray-500 text-sm">
        No members found.
      </div>
    );
  }

  return (
    <ul className="divide-y" role="list" aria-label="Team members">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center justify-between px-6 py-4"
        >
          <div className="flex items-center gap-3">
            {member.profiles.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.profiles.avatar_url}
                alt=""
                className="w-8 h-8 rounded-full bg-gray-200"
                aria-hidden="true"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
                aria-hidden="true"
              >
                {(member.profiles.full_name ?? member.profiles.email)
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">
                {member.profiles.full_name || member.profiles.email}
              </p>
              <p className="text-xs text-gray-500">{member.profiles.email}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
              roleBadgeColors[member.role] ?? roleBadgeColors.member
            }`}
          >
            {member.role}
          </span>
        </li>
      ))}
    </ul>
  );
}
