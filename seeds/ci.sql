-- Fixture for the CI smoke test. Two projects, chosen to exercise both render
-- paths: one with every field populated, one with every nullable column NULL.
--
-- Separate from seeds/seed.sql because that one is generated from
-- .archive/projects.json, which is gitignored and so unavailable in CI.

DELETE FROM project_tags;
DELETE FROM tags;
DELETE FROM projects;

INSERT INTO tags (name) VALUES ('rust'), ('ci-fixture');

-- Everything populated: image, both links, a markdown body, role and year.
--
-- The description carries a literal </script> on purpose. It reaches the
-- JSON-LD block in src/ui/primitives/json-ld.tsx, which escapes `<` so the
-- string cannot close the block and turn the rest of the payload into markup.
-- Without markup somewhere in the fixture that assertion cannot fail, and an
-- assertion that cannot fail is not one. Descriptions are admin-authored, so
-- this is the real input shape rather than a contrived one.
INSERT INTO projects
  (id, slug, title, description, site_url, repo_url, media_key, body_md, role, year, position, published)
VALUES (
  'ci-full',
  'ci-fixture-full',
  'CI Fixture (full)',
  'Every column populated, so the detail page renders its complete layout. </script> stays inert.',
  'https://example.com',
  'https://github.com/example/repo',
  'projects/ci-fixture.png',
  '## Heading

Body text with **bold** and a [link](/projects).

```rust
fn main() { println!("fixture"); }
```',
  'Creator',
  '2026',
  0,
  1
);

-- Every nullable column NULL: no image (placeholder), no links, no body
-- (fallback copy). Guards the conditional rendering that three real projects
-- depend on.
INSERT INTO projects
  (id, slug, title, description, site_url, repo_url, media_key, body_md, role, year, position, published)
VALUES (
  'ci-bare',
  'ci-fixture-bare',
  'CI Fixture (bare)',
  'Nullable columns are all NULL, so nothing should render a dead link.',
  NULL, NULL, NULL, NULL, NULL, NULL,
  1,
  1
);

-- Unpublished: must not appear in listings, and its detail page must 404.
INSERT INTO projects
  (id, slug, title, description, position, published)
VALUES (
  'ci-draft',
  'ci-fixture-draft',
  'CI Fixture (unpublished)',
  'published = 0, so listProjects and getProject must both exclude it.',
  2,
  0
);

INSERT INTO project_tags (project_id, tag_id, position)
  SELECT 'ci-full', id, 0 FROM tags WHERE name = 'rust';
INSERT INTO project_tags (project_id, tag_id, position)
  SELECT 'ci-full', id, 1 FROM tags WHERE name = 'ci-fixture';
