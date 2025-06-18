// scoring_groups_and_playoffs.js

module.exports = {
  stagePoints: {
    opening: 1,        // Opening Round (QF) – 1 pkt
    upper_sf: 2,       // Upper Semi-finals – 2 pkt
    upper_final: 3,    // Upper Final – 3 pkt
    lower_r1: 2,       // Lower Round 1 – 2 pkt
    lower_sf: 2,       // Lower Semi-finals – 2 pkt
    lower_final: 3     // Lower Final – 3 pkt
  },
  singleElimPoints: {
    qf1: 3,            // Ćwierćfinał 1 – 3 pkt
    qf2: 3,            // Ćwierćfinał 2 – 3 pkt
    sf1: 4,            // Półfinał 1 – 4 pkt
    sf2: 4,            // Półfinał 2 – 4 pkt
    final: 5           // Finał – 5 pkt
  }
};
