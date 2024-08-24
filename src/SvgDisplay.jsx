import { useEffect, useState, useRef } from "react";
import labelDict from "./countries.json";
import UNStates from "./UN.json";
import Shortcuts from "./Shortcut";
import axios from "axios";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";

const SvgDisplay = () => {
  const [flags, setFlags] = useState([]);
  const [alphabeticOrderFlags, setAlphabeticOrderFlags] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const inputRef = useRef(null);
  const [filter, setFilter] = useState("");
  const [onlyUN, setOnlyUN] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/svgs")
      .then((response) => {
        const abbreviation = (svg) => svg.slice(0, -4).toUpperCase();
        const flagList = response.data
          .filter((svg) => !onlyUN || UNStates[abbreviation(svg)])
          .map((svg) => [svg, labelDict[abbreviation(svg)], 0, 0]);
        setAlphabeticOrderFlags(flagList);
        setFlags(shuffled(flagList));
      })
      .catch((error) => {
        console.error("There was an error fetching the SVG files!", error);
      });
  }, [onlyUN]);

  useEffect(() => {
    const numberOfFlagsNotLearned = flags.map(([a, b, success, c]) => success).filter((el) => el === 0).length;
    setScore(100 - Math.floor((numberOfFlagsNotLearned * 100) / flags.length));
  }, [flags, currentIndex]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [flags, currentIndex, showAnswer]);

  const handleKeyDown = (e) => {
    if (e.target.nodeName.toLowerCase() !== "input") {
      switch (e.key) {
        case "ArrowRight":
          next();
          break;
        case " ":
          e.preventDefault();
          show();
          break;
        case "Tab":
          e.preventDefault();
          inputRef.current.focus();
          break;
        default:
      }
    } else {
      switch (e.key) {
        case "Escape":
          e.target.blur();
          e.target.value = "";
          setFilter(e.target.value);
          break;
        default:
      }
    }
  };

  const shuffled = (arr) => {
    let shuffledArray = [...arr];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  const [svg, label, nbSuccess, retryFrequency] = flags[currentIndex] || [];

  const move = (currentFlag, x) => {
    let newIndex = (currentIndex + x) % flags.length;
    setFlags((flags) => flags.toSpliced(currentIndex, 1).toSpliced(newIndex, 0, currentFlag.toSpliced(3, 1, x)));
    if (newIndex > currentIndex) setCurrentIndex((currentIndex) => (currentIndex - 1) % flags.length);
  };

  const next = () => {
    const currentFlag = flags[currentIndex];
    if (showAnswer) {
      move(currentFlag, 10);
    } else {
      if (currentFlag[3] > 0 && currentFlag[3] * 2 < flags.length) {
        move(currentFlag, currentFlag[3] * 2);
      } else {
        setFlags((flags) =>
          flags.toSpliced(currentIndex, 1, currentFlag.toSpliced(2, 2, flags[currentIndex][2] + 1, 0))
        );
      }
    }
    setCurrentIndex((currentIndex) => (currentIndex + 1) % flags.length);
    setShowAnswer(false);
  };

  const show = () => {
    setShowAnswer(true);
  };

  const handleChange = (e) => setFilter(e.target.value);

  return (
    <div id="container">
      <div id="quizz">
        <Shortcuts />
        <div className="score">{score} %</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Form.Check // prettier-ignore
            style={{ marginTop: "20px" }}
            type="switch"
            id="custom-switch"
            label="Only UN states"
            onChange={(e) => setOnlyUN(!onlyUN)}
          />
          <img id="mainImage" src={`http://localhost:5000/svgs/${svg}`} alt={svg} />
          {showAnswer ? (
            <span>
              <a
                target="_blank"
                href={"https://www.google.com/search?q=" + label.replaceAll(" ", "+")}
                style={{ color: "white", textDecoration: "none" }}
              >
                {label}
              </a>
            </span>
          ) : (
            <Button variant="light" onClick={show}>
              Show answer
            </Button>
          )}
          <Button onClick={next} style={{ margin: "20px" }}>
            Next
          </Button>
        </div>
      </div>
      <div id="comparePage">
        <div id="compareInput">
          Compare with <input ref={inputRef} type="text" onChange={handleChange} placeholder="Search country..." />
        </div>
        <div id="flags">
          {alphabeticOrderFlags
            .filter(([svg, label]) => label.toUpperCase().includes(filter.trim().toUpperCase()))
            .map(([svg, label]) => {
              return (
                <div key={svg} className="flagCard">
                  <img className="flagImage" src={`http://localhost:5000/svgs/${svg}`} alt={svg} />
                  <span>
                    <a
                      target="_blank"
                      href={"https://www.google.com/search?q=" + label.replaceAll(" ", "+")}
                      style={{ color: "white", textDecoration: "none" }}
                    >
                      {label}
                    </a>
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default SvgDisplay;
