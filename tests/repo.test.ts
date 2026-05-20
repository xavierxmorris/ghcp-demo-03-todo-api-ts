import { describe, it, expect, beforeEach } from 'vitest';
import { TodoRepo } from '../src/repo.js';
import { NotFoundError } from '../src/errors.js';

describe('TodoRepo', () => {
  let repo: TodoRepo;
  beforeEach(() => { repo = new TodoRepo(); });

  it('creates and lists todos', () => {
    const t = repo.create({ title: 'write demo' });
    expect(t.id).toBeTruthy();
    expect(t.title).toBe('write demo');
    expect(t.done).toBe(false);
    expect(repo.list()).toHaveLength(1);
  });

  it('updates an existing todo', () => {
    const t = repo.create({ title: 'a' });
    const updated = repo.update(t.id, { done: true });
    expect(updated.done).toBe(true);
    expect(updated.title).toBe('a');
  });

  it('removes a todo', () => {
    const t = repo.create({ title: 'a' });
    repo.remove(t.id);
    expect(repo.list()).toHaveLength(0);
  });

  it('throws NotFoundError on missing id', () => {
    expect(() => repo.get('nope')).toThrow(NotFoundError);
    expect(() => repo.update('nope', { done: true })).toThrow(NotFoundError);
    expect(() => repo.remove('nope')).toThrow(NotFoundError);
  });
});
