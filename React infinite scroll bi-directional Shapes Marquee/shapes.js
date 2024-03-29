class MarqueeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activeCard: null };
  }

  handleCardClick = (index) => {
    this.setState({ activeCard: index });
  };

  handleClosePopup = () => {
    this.setState({ activeCard: null });
  };

  render() {
    const { activeCard } = this.state;
    const cards = ["circle", "rectangle", "triangle", "ellipse", "square", "pentagon", "hexagon", "star"].map((shape, index) => (
      <Card key={index} index={index} shape={shape} onClick={this.handleCardClick} />
    ));

    return (
      <div onClick={this.handleClosePopup}>
        <article className="wrapper">
          <div className="marquee">
            <div className="marquee__group">{cards}</div>
            <div className="marquee__group">{cards}</div>
          </div>
          <div className="marquee marquee--reverse">
            <div className="marquee__group">{cards}</div>
            <div className="marquee__group">{cards}</div>
          </div>
        </article>
        {activeCard !== null && <div className="popup">You clicked on card {activeCard + 1}</div>}
      </div>
    );
  }
}

class Card extends React.Component {
  render() {
    const { shape, index, onClick } = this.props;
    const shapes = {
      circle: <circle cx="50" cy="50" r="40" />,
      rectangle: <rect x="10" y="10" width="80" height="50" />,
      triangle: <polygon points="50,10 10,90 90,90" />,
      ellipse: <ellipse cx="50" cy="50" rx="40" ry="25" />,
      square: <rect x="10" y="10" width="80" height="80" />,
      pentagon: <polygon points="50,10 10,40 25,90 75,90 90,40" />,
      hexagon: <polygon points="50,10 90,25 90,75 50,90 10,75 10,25" />,
      star: <polygon points="50,5 61,35 95,35 67,55 78,85 50,65 22,85 33,55 5,35 39,35" />
    };
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" onClick={() => onClick(index)}>{shapes[shape]}</svg>;
  }
}

ReactDOM.render(<MarqueeComponent />, document.getElementById('root'));
