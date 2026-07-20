import { getIn, setIn, deepEqual, touchAll, hasErrors } from '../forms/utils/paths.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

// getIn / setIn nested
{
  const obj = { social: { facebook: 'a' }, friends: ['x', 'y'] };
  assert(getIn(obj, 'social.facebook') === 'a', 'getIn nested');
  assert(getIn(obj, 'friends[1]') === 'y', 'getIn array');
  const next = setIn(obj, 'social.twitter', 'b');
  assert(next.social.twitter === 'b', 'setIn nested');
  assert(obj.social.twitter === undefined, 'setIn immutable');
  const arr = setIn(obj, 'friends[0]', 'z');
  assert(arr.friends[0] === 'z' && obj.friends[0] === 'x', 'setIn array immutable');
}

// quoted path
{
  const obj = { 'owner.name': 'jane' };
  assert(getIn(obj, "['owner.name']") === 'jane', 'quoted getIn');
}

// deepEqual / touchAll / hasErrors
{
  assert(deepEqual({ a: 1 }, { a: 1 }), 'deepEqual true');
  assert(!deepEqual({ a: 1 }, { a: 2 }), 'deepEqual false');
  const touched = touchAll({ a: '', b: { c: '' } });
  assert(touched.a === true && touched.b.c === true, 'touchAll');
  assert(hasErrors({ a: 'err' }), 'hasErrors');
  assert(!hasErrors({}), 'hasErrors empty');
  assert(!hasErrors({ a: undefined }), 'hasErrors undefined leaf');
}

console.log('forms-paths: PASS');
