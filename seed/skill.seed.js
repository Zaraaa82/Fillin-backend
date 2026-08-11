const Skill = require('../models/Skill');

const skillNames = [
  'customer service', 'food service', 'barista', 'cash handling',
  'point of sale', 'event setup', 'guest reception', 'banquet service',
  'inventory handling', 'merchandising', 'warehouse operations', 'packing',
  'teamwork', 'time management', 'arabic communication', 'english communication',
  'food safety', 'order picking', 'crowd guidance', 'ticket scanning',
  'housekeeping', 'basic computer skills', 'product knowledge', 'delivery coordination',
];

async function seedSkills() {
  const skills = await Skill.insertMany(skillNames.map((name) => ({ name })));
  return Object.fromEntries(skills.map((skill) => [skill.name, skill]));
}

module.exports = seedSkills;
