const parseFunctionToTool = (func) => {
  const name = func.name;
  if (!name) throw new Error('Function must have a name');

  const comments = func.toString().match(/\/\*\*(.*)\*\//s);
  const description = comments ? comments[1].trim().replace(/^\* /gm, '').replace(/\n/g, ' ') : '';

  const paramsStr = func.toString().match(/function\s+\w+\s*\((.*?)\)/)?.[1] || '()';
  const params = paramsStr.split(',').map(p => p.trim()).filter(p => p);
  const parameters = {
    type: 'object',
    properties: {},
    required: []
  };
  params.forEach(param => {
    // Пример: param = "userId: string" -> {type: "string"}
    const match = param.match(/(\w+):\s*(\w+)/);
    if (match) {
      const [_, name, type] = match;
      parameters.properties[name] = { type: type.toLowerCase() === 'number' ? 'number' : 'string', description: '' };
      parameters.required.push(name);
    }
  });

  return {
    type: 'function',
    function: { name, description, parameters }
  };
};

const parseTools = (functions) => {
  if (!Array.isArray(functions)) functions = [functions];
  return functions.map(parseFunctionToTool);
};

module.exports = { parseFunctionToTool, parseTools };