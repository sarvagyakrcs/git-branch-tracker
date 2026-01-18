import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Projects table - top level container
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  masterBranch: varchar("master_branch", { length: 255 })
    .notNull()
    .default("main"),
  repoUrl: varchar("repo_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Features table - groups of related branches (e.g., 11627, 11628)
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  identifier: varchar("identifier", { length: 100 }).notNull(), // e.g., "11627"
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Agent Eval Feature"
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#6366f1"), // hex color for UI
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Branches table - individual branches in a stack
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  featureId: integer("feature_id")
    .references(() => features.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "sarvagya-11627-db-infrastructure"
  shortName: varchar("short_name", { length: 100 }), // e.g., "db-infrastructure"
  position: integer("position").notNull().default(1), // order in stack

  // Self-referencing for parent branch
  parentBranchId: integer("parent_branch_id"),

  // Status tracking
  // 'planned' | 'active' | 'pr_raised' | 'merged' | 'deprecated' | 'blocked'
  status: varchar("status", { length: 50 }).notNull().default("active"),

  // PR information
  prUrl: varchar("pr_url", { length: 500 }),
  prNumber: integer("pr_number"),
  prStatus: varchar("pr_status", { length: 50 }), // 'open' | 'merged' | 'closed'

  // Notes
  notes: text("notes"),
  isPartOfStack: boolean("is_part_of_stack").notNull().default(true),
  
  // Plan mode - branch exists only in tracker, not in git yet
  isPlanned: boolean("is_planned").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Branch comparisons history
export const branchComparisons = pgTable("branch_comparisons", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  parentBranch: varchar("parent_branch", { length: 255 }).notNull(),
  childBranch: varchar("child_branch", { length: 255 }).notNull(),
  isAncestor: boolean("is_ancestor"),
  mergeBase: varchar("merge_base", { length: 100 }),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  features: many(features),
  comparisons: many(branchComparisons),
}));

export const featuresRelations = relations(features, ({ one, many }) => ({
  project: one(projects, {
    fields: [features.projectId],
    references: [projects.id],
  }),
  branches: many(branches),
}));

export const branchesRelations = relations(branches, ({ one }) => ({
  feature: one(features, {
    fields: [branches.featureId],
    references: [features.id],
  }),
  parentBranch: one(branches, {
    fields: [branches.parentBranchId],
    references: [branches.id],
  }),
}));

// Types
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Feature = typeof features.$inferSelect;
export type NewFeature = typeof features.$inferInsert;
export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;

