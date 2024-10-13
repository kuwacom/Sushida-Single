const SpineCharacters = [
  {
    name: "haruka",
    id: "Haruka_home",
    defaultAnimation: "Idle_01",
    offset: { // スケルトンの中心位置からのオフセット
      x: -400,
      y: -1000
    },
  facePosition: { // 顔の位置の絶対座標
      x: 380,
      y: 800
    }
  },
  {
    name: "hoshino(rinsen)",
    id: "CH0258_home",
    defaultAnimation: "Idle_1",
    offset: {
      x: -400,
      y: 0
    },
    facePosition: {
      x: 450,
      y: 1300
    }
  },
  {
    name: "serika(newyear)",
    id: "Serika_Newyear_home",
    defaultAnimation: "Idle_01",
    offset: {
      x: 0,
      y: 0
    },
    facePosition: {
      x: -500,
      y: 1300
    }
  }
]

export default SpineCharacters;