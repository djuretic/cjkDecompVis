export interface DecompositionMap {
  [character: string]: Decomposition;
}

export interface Decomposition {
  character: string;
  type: string;
  typeFull: string;
  components: string[];
}