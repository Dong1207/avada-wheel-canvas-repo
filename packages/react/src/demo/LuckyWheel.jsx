import LuckyWheel from "../components/LuckyWheel";
import React from "react";

export default class Wheel extends React.Component {
  constructor() {
    super();
    this.myLucky = React.createRef();
    this.state = {
      currPrize: "Current Prize",
      blocks: [],
      prizes: [
        {
          name: "Free gift",
          background: "#FF8080",
          fonts: [{text: "Free gift", top: "30%", fontSize: "14px"}],
        },
        {
          name: "35% off",
          background: "#FFB2B2",
          fonts: [{text: "35% off", top: "30%", fontSize: "14px"}],
        },
        {
          name: "Good Luck",
          background: "#CC6666",
          fonts: [{text: "Good Luck", top: "30%", fontSize: "14px"}],
        },
        {
          name: "IPhone 16 Pro max",
          background: "#FFE0E0",
          fonts: [{text: "IPhone 16 Pro max", top: "30%", fontSize: "14px"}],
        },
        {
          name: "Thank You",
          background: "#FF8080",
          fonts: [{text: "Thank You", top: "30%", fontSize: "14px"}],
        },
        {
          name: "Red Envelope",
          background: "#FFB2B2",
          fonts: [{text: "Red Envelope", top: "30%", fontSize: "14px"}],
        },
        {
          name: "Extra 3 Draws",
          background: "#CC6666",
          fonts: [{text: "Extra 3 Draws", top: "30%", fontSize: "14px"}],
        },
        {
          name: "Gift",
          background: "#FFE0E0",
          fonts: [{text: "Gift", top: "30%", fontSize: "14px"}],
        },
      ],
      buttons: [
        {
          radius: "35px",
          background: "#ffdea0",
          fonts: [{text: "Start\nDraw", fontSize: "18px", top: -18}],
        },
      ],
    };
  }
  render() {
    return (
      <div>
        Current Prize: {this.state.currPrize}
        <LuckyWheel
          ref={this.myLucky}
          width="300px"
          height="300px"
          blocks={this.state.blocks}
          prizes={this.state.prizes}
          buttons={this.state.buttons}
          defaultStyle={this.state.defaultStyle}
          onStart={() => {
            console.log(this.state.currPrize);
            this.myLucky.current.play();
            setTimeout(() => {
              const index = (Math.random() * 6) >> 0;
              this.myLucky.current.stop(index);
            }, 2500);
          }}
          onEnd={(prize) => {
            this.setState({
              currPrize: prize.title,
            });
          }}
        ></LuckyWheel>
      </div>
    );
  }
}
