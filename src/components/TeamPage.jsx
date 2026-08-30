import React from 'react';
import {
  IconUsers,
  IconAward,
  IconCpu,
  IconFileText,
  IconWrench,
  IconBox
} from './Icons';

const LEADER_MEMBER = {
  id: 1,
  prefix: "Mr.",
  name: "Phanyawat Wanmarat",
  title: "Team Leader & Lead Developer",
  photo: "/assets/team/phanyawat.jpg",
  highlight: true,
  roles: [
    { label: "Leader", icon: IconAward, color: "blue" },
    { label: "Programmer", icon: IconCpu, color: "cyan" },
    { label: "Research Paper", icon: IconFileText, color: "green" }
  ]
};

const OTHER_MEMBERS = [
  {
    id: 2,
    prefix: "Mr.",
    name: "Noppawit Kiriphet",
    title: "Material & Mechanical Assistant",
    photo: "/assets/team/noppawit.jpg",
    highlight: false,
    roles: [
      { label: "Material & Mechanic Assistant", icon: IconWrench, color: "cyan" }
    ]
  },
  {
    id: 3,
    prefix: "Mr.",
    name: "Papungkorn Yimyong",
    title: "Mechanical Engineer",
    photo: "/assets/team/papungkorn.jpg",
    highlight: false,
    roles: [
      { label: "Mechanic", icon: IconWrench, color: "blue" }
    ]
  },
  {
    id: 4,
    prefix: "Mr.",
    name: "Supathat Tangtrongjit",
    title: "Materials Specialist",
    photo: "/assets/team/supathat.jpg",
    highlight: false,
    roles: [
      { label: "วัสดุ (Materials)", icon: IconBox, color: "green" }
    ]
  },
  {
    id: 5,
    prefix: "Mr.",
    name: "Phakin Chaorua",
    title: "Materials Specialist",
    photo: "/assets/team/phakin.jpg",
    highlight: false,
    roles: [
      { label: "วัสดุ (Materials)", icon: IconBox, color: "green" }
    ]
  }
];

export function TeamPage() {
  return (
    <div className="team-page-container">
      {/* Header Banner */}
      <div className="team-header-card">
        <div className="team-header-backdrop"></div>
        <div className="team-header-content">
          <div className="team-header-badge">
            <IconUsers className="header-badge-icon" /> PROJECT DEVELOPMENT TEAM
          </div>
          <h1 className="team-header-title">Meet the Engineering Team</h1>
          <p className="team-header-subtitle">
            The minds behind RUEA ROY RC — combining software development, research, mechanical engineering, and hardware assembly.
          </p>

          <div className="team-hero-stats">
            <div className="team-stat-pill">
              <span className="t-stat-num">5</span>
              <span className="t-stat-label">Engineers</span>
            </div>
            <div className="team-stat-pill">
              <span className="t-stat-num">4</span>
              <span className="t-stat-label">Disciplines</span>
            </div>
            <div className="team-stat-pill">
              <span className="t-stat-num">SPR41</span>
              <span className="t-stat-label">Team Unit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Row: Centered Leader Card */}
      <div className="team-leader-wrapper">
        <div className="team-card leader-card">
          <div className="team-photo-wrapper">
            <img
              src={LEADER_MEMBER.photo}
              alt={`${LEADER_MEMBER.prefix} ${LEADER_MEMBER.name}`}
              className="team-photo-img"
            />
            <span className="leader-star-badge" title="Team Leader">
              LEADER
            </span>
          </div>

          <div className="team-info">
            <span className="member-prefix">{LEADER_MEMBER.prefix}</span>
            <h2 className="member-name">{LEADER_MEMBER.name}</h2>
            <p className="member-title">{LEADER_MEMBER.title}</p>
          </div>

          <div className="roles-container">
            <span className="roles-heading">Responsibilities:</span>
            <div className="roles-list">
              {LEADER_MEMBER.roles.map((role, idx) => {
                const RoleIcon = role.icon;
                return (
                  <span key={idx} className={`role-badge role-${role.color}`}>
                    <RoleIcon className="role-icon" />
                    <span>{role.label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2x2 Grid Section for the 4 Team Members */}
      <div className="team-2x2-grid">
        {OTHER_MEMBERS.map((member) => (
          <div key={member.id} className="team-card">
            <div className="team-photo-wrapper">
              <img
                src={member.photo}
                alt={`${member.prefix} ${member.name}`}
                className="team-photo-img"
              />
            </div>

            <div className="team-info">
              <span className="member-prefix">{member.prefix}</span>
              <h2 className="member-name">{member.name}</h2>
              <p className="member-title">{member.title}</p>
            </div>

            <div className="roles-container">
              <span className="roles-heading">Responsibilities:</span>
              <div className="roles-list">
                {member.roles.map((role, idx) => {
                  const RoleIcon = role.icon;
                  return (
                    <span key={idx} className={`role-badge role-${role.color}`}>
                      <RoleIcon className="role-icon" />
                      <span>{role.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
