import React from "react";

const COLORS = [
  "#ff6b6b", "#4834d4", "#00d2d3", "#a55eea", "#ff9f43", "#ff6b9d", "#222f3e"
];

function getColorForUser(userId) {
  // Simple hash for color assignment
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash += userId.charCodeAt(i);
  return COLORS[hash % COLORS.length];
}

const UserCursors = ({ cursors, myUserId }) => (
  <>
    {Object.entries(cursors).map(([userId, cursor]) =>
      userId !== myUserId && cursor.active ? (
        <div
          key={userId}
          className="user-cursor"
          style={{
            position: "absolute",
            left: cursor.x,
            top: cursor.y,
            pointerEvents: "none",
            zIndex: 10,
            color: getColorForUser(userId),
            fontSize: 18,
            fontWeight: "bold",
            transition: "left 0.05s, top 0.05s"
          }}
        >
          <span style={{ color: getColorForUser(userId) }}>⬤</span>
        </div>
      ) : null
    )}
  </>
);

export default UserCursors;