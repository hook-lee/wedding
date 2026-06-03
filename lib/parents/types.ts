export type ParentStatus = "alive" | "go" | "hyeon";
export type ParentEntry = { name: string; status: ParentStatus };
export type ParentsBlock = {
  groom_father?: ParentEntry;
  groom_mother?: ParentEntry;
  bride_father?: ParentEntry;
  bride_mother?: ParentEntry;
};
