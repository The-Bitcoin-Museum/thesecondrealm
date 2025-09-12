
export const CUBE_SIZE = 210000;


export const POS_FAR_AWAY = [[0, 0, 10000000000000], [0, 0, 0]];
export const POS_FARFAR_AWAY = [[0, 0, 20000000000000], [0, 0, 0]];

export const POS_PREDEFINED = {
  'ORIGIN (0.0, 0.0, 0.0)': [[10, 10, 10], [0, -3*Math.PI/4, 0]],
  'MID X-AXIS (0.5, 0.0, 0.0)': [[CUBE_SIZE/2, 10, 10], [0, Math.PI, 0]],
  'END X-AXIS (1.0, 0.0, 0.0)': [[CUBE_SIZE - 10, 10, 10], [0, 3*Math.PI/4, 0]],
  'END X-AXIS, MID Z-AXIS (1.0, 0.0, 0.5)': [[CUBE_SIZE - 10, 10, CUBE_SIZE/2], [0, Math.PI/2, 0]],
  'END X-AXIS, END Z-AXIS (1.0, 0.0, 1.0)': [[CUBE_SIZE - 10, 10, CUBE_SIZE - 10], [0, Math.PI/4, 0]],
  'MID X-AXIS, END Z-AXIS (0.5, 0.0, 1.0)': [[CUBE_SIZE/2, 10, CUBE_SIZE - 10], [0, 0, 0]],
  'END Z-AXIS (0.0, 0.0, 1.0)': [[10, 10, CUBE_SIZE - 10], [0, -Math.PI/4, 0]],
  'MID Z-AXIS (0.0, 0.0, 0.5)': [[10, 10, CUBE_SIZE/2], [0, -Math.PI/2, 0]],
};