import { useState, useEffect } from 'react';
import Papa from 'papaparse';

import './App.css';

function App() {
  const [start, setStart] = useState(false);
  const [offset, setOffset] = useState(0);
  const [btnMessage, setBtnMessage] = useState("Begin");
  const [mbti, setMBTI] = useState();
  const [mbtiInfo, setMBTIInfo] = useState();
  const [sourceText, setSourceText] = useState();
  const [source, setSource] = useState();
  const [blankText1, setBlankText1] = useState();
  const [blankText2, setBlankText2] = useState();

  const [q1, setQ1] = useState();
  const [q2, setQ2] = useState();
  const [q3, setQ3] = useState();
  const [q4, setQ4] = useState();
  const [q5, setQ5] = useState();
  const [q6, setQ6] = useState();
  const [q7, setQ7] = useState();
  const [q8, setQ8] = useState();
  const [q9, setQ9] = useState();
  const [q10, setQ10] = useState();

  const [q1val, setQ1val] = useState(0);
  const [q2val, setQ2val] = useState(0);
  const [q3val, setQ3val] = useState(0);
  const [q4val, setQ4val] = useState(0);
  const [q5val, setQ5val] = useState(0);
  const [q6val, setQ6val] = useState(0);
  const [q7val, setQ7val] = useState(0);
  const [q8val, setQ8val] = useState(0);
  const [q9val, setQ9val] = useState(0);
  const [q10val, setQ10val] = useState(0);

  const [questions, setQuestions] = useState([]);
  const [category, setCategory] = useState([]);
  const [coeff, setCoeff] = useState([]);
  // answers are from user input, from -3 to 3 *** NOTE: -3 is strongly agree, 3 is strongly disagree ***
  const [answers1, setAnswers1] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [answers2, setAnswers2] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [answers3, setAnswers3] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [answers4, setAnswers4] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  const loadDataOnlyOnce = function () {
    const questions_ = [];
    const category_ = [];
    const coeff_ = [];
    Papa.parse('./ordered_questions.csv', {
      download: true,
      header: false,
      complete: function (results) {
        results.data.forEach((row) => {
          questions_.push(row[0]);
          category_.push(parseInt(row[1]));
          coeff_.push(parseInt(row[2]));
        });
      }
    });
    setQuestions(questions_);
    setCategory(category_);
    setCoeff(coeff_);
  };

  useEffect(() => {
    loadDataOnlyOnce();
  }, [start]);

  const next = function () {
    window.scrollTo({
      top: 72,
      left: 0,
      behavior: "smooth"
    });
    setQ1val(0);
    setQ2val(0);
    setQ3val(0);
    setQ4val(0);
    setQ5val(0);
    setQ6val(0);
    setQ7val(0);
    setQ8val(0);
    setQ9val(0);
    setQ10val(0);
    setQ1(questions[offset + 0]);
    setQ2(questions[offset + 1]);
    setQ3(questions[offset + 2]);
    setQ4(questions[offset + 3]);
    setQ5(questions[offset + 4]);
    setQ6(questions[offset + 5]);
    setQ7(questions[offset + 6]);
    setQ8(questions[offset + 7]);
    setQ9(questions[offset + 8]);
    setQ10(questions[offset + 9]);
    setOffset(offset + 10);
  };

  const begin = function () {
    setStart(true);
    next();
  };

  const getScores = function () {
    const intercepts = [-5, 15, 5, 0]; // predisposition in population
    const weight = -2.75;

    const scores = [];
    for (let category_id = 0; category_id < 4; category_id++) {
      const c_indexs = [];
      category.filter((num, index) => {
        if (num === category_id) {
          c_indexs.push(index)
        }
      });
      const all_answers = answers1.concat(answers2).concat(answers3).concat(answers4);
      const c_answers = [];
      const c_coeffs = [];
      for (const idx of c_indexs) {
        c_answers.push(all_answers[idx]);
        c_coeffs.push(coeff[idx] * weight);
      }
      let raw_score = 0;
      for (let i = 0; i < c_answers.length; i++) {
        raw_score += c_answers[i] * c_coeffs[i]
      }
      raw_score += intercepts[category_id];
      let score;
      if (raw_score > 0) {
        score = Math.floor(raw_score);
      } else {
        score = Math.ceil(raw_score);
      }
      if (score < -100) {
        score = -100;
      } else if (score > 100) {
        score = 100;
      } else if (score === 0) {
        score = -1;
      }
      scores.push(Math.round(score));
    }
    return scores;
  }

  const getMBTI = function (scores) {
    const category_key = [['E', 'I'], ['N', 'S'], ['T', 'F'], ['J', 'P']]
    let mbti_ = '';
    for (let category_id = 0; category_id < 4; category_id++) {
      const score = scores[category_id]
      if (score > 0) {
        mbti_ = mbti_.concat(category_key[category_id][0]);
      } else {
        mbti_ = mbti_.concat(category_key[category_id][1]);
      }
    }
    return mbti_;
  };

  const finish = function () {
    next();
    // calculate MBTI
    const scores = getScores();
    const mbti_ = getMBTI(scores);
    setMBTI("Your MBTI is: ".concat(mbti_));
    fetch("./mbti_info/".concat(mbti_).concat(".txt"))
      .then(response => response.text())
      .then(text => setMBTIInfo(text));

    setBlankText1(<div><br /><br /></div>);
    setBlankText2(<div><br /><br /><br /></div>);
    setSourceText("Source: ");
    setSource("16personalities.com/".concat(mbti_.toLowerCase()).concat("-personality"));

    setAnswers1([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setAnswers2([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setAnswers3([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setAnswers4([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  };

  const handleQ1 = function (val) {
    setQ1val(val);
    if (offset === 10) {
      setAnswers1([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 20) {
      setAnswers2([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 30) {
      setAnswers3([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 40) {
      setAnswers4([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    }
  };
  const handleQ2 = function (val) {
    setQ2val(val);
    if (offset === 10) {
      setAnswers1([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 20) {
      setAnswers2([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 30) {
      setAnswers3([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 40) {
      setAnswers4([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    }
  };
  const handleQ3 = function (val) {
    setQ3val(val);
    if (offset === 10) {
      setAnswers1([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 20) {
      setAnswers2([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 30) {
      setAnswers3([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 40) {
      setAnswers4([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    }
  };
  const handleQ4 = function (val) {
    setQ4val(val);
    if (offset === 10) {
      setAnswers1([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 20) {
      setAnswers2([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 30) {
      setAnswers3([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 40) {
      setAnswers4([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    }
  };
  const handleQ5 = function (val) {
    setQ5val(val);
    if (offset === 10) {
      setAnswers1([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 20) {
      setAnswers2([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 30) {
      setAnswers3([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 40) {
      setAnswers4([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    }
  };
  const handleQ6 = function (val) {
    setQ6val(val);
    if (offset === 10) {
      setAnswers1([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 20) {
      setAnswers2([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 30) {
      setAnswers3([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 40) {
      setAnswers4([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    }
  };
  const handleQ7 = function (val) {
    setQ7val(val);
    if (offset === 10) {
      setAnswers1([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 20) {
      setAnswers2([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 30) {
      setAnswers3([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 40) {
      setAnswers4([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    }
  };
  const handleQ8 = function (val) {
    setQ8val(val);
    if (offset === 10) {
      setAnswers1([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 20) {
      setAnswers2([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 30) {
      setAnswers3([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 40) {
      setAnswers4([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    }
  };
  const handleQ9 = function (val) {
    setQ9val(val);
    if (offset === 10) {
      setAnswers1([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 20) {
      setAnswers2([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 30) {
      setAnswers3([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 40) {
      setAnswers4([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    }
  };
  const handleQ10 = function (val) {
    setQ10val(val);
    if (offset === 10) {
      setAnswers1([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 20) {
      setAnswers2([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 30) {
      setAnswers3([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    } else if (offset === 40) {
      setAnswers4([q1val, q2val, q3val, q4val, q5val, q6val, q7val, q8val, q9val, q10val]);
    }
  };

  let nextButton = <button onClick={next}>
    Next
  </button>;
  if (offset === 40) {
    // reached last page
    nextButton = <button onClick={finish}>
      Finish
    </button>;
  } else if (offset > 40) {
    // reached end of all questions
    setStart(false);
    setOffset(0);
    setBtnMessage("Retake")
  }

  if (start) {
    return (
      <div className="App">
        <h1 className="heading"> Work Style Survey </h1>

        <p>{q1}</p>
        <div className="choices">
          <label> <input type="radio" name="q1" checked={q1val === -3} onChange={() => handleQ1(-3)} /> strongly agree </label>
          <label> <input type="radio" name="q1" checked={q1val === -2} onChange={() => handleQ1(-2)} /> agree </label>
          <label> <input type="radio" name="q1" checked={q1val === -1} onChange={() => handleQ1(-1)} /> somewhat agree </label>
          <label> <input type="radio" name="q1" checked={q1val === 0} onChange={() => handleQ1(0)} /> neutral </label>
          <label> <input type="radio" name="q1" checked={q1val === 1} onChange={() => handleQ1(1)} /> somewhat disagree </label>
          <label> <input type="radio" name="q1" checked={q1val === 2} onChange={() => handleQ1(2)} /> disagree </label>
          <label> <input type="radio" name="q1" checked={q1val === 3} onChange={() => handleQ1(3)} /> strongly disagree </label>
        </div>
        <p>{q2}</p>
        <div className="choices">
          <label> <input type="radio" name="q2" checked={q2val === -3} onChange={() => handleQ2(-3)} /> strongly agree </label>
          <label> <input type="radio" name="q2" checked={q2val === -2} onChange={() => handleQ2(-2)} /> agree </label>
          <label> <input type="radio" name="q2" checked={q2val === -1} onChange={() => handleQ2(-1)} /> somewhat agree </label>
          <label> <input type="radio" name="q2" checked={q2val === 0} onChange={() => handleQ2(0)} /> neutral </label>
          <label> <input type="radio" name="q2" checked={q2val === 1} onChange={() => handleQ2(1)} /> somewhat disagree </label>
          <label> <input type="radio" name="q2" checked={q2val === 2} onChange={() => handleQ2(2)} /> disagree </label>
          <label> <input type="radio" name="q2" checked={q2val === 3} onChange={() => handleQ2(3)} /> strongly disagree </label>
        </div>
        <p>{q3}</p>
        <div className="choices">
          <label> <input type="radio" name="q3" checked={q3val === -3} onChange={() => handleQ3(-3)} /> strongly agree </label>
          <label> <input type="radio" name="q3" checked={q3val === -2} onChange={() => handleQ3(-2)} /> agree </label>
          <label> <input type="radio" name="q3" checked={q3val === -1} onChange={() => handleQ3(-1)} /> somewhat agree </label>
          <label> <input type="radio" name="q3" checked={q3val === 0} onChange={() => handleQ3(0)} /> neutral </label>
          <label> <input type="radio" name="q3" checked={q3val === 1} onChange={() => handleQ3(1)} /> somewhat disagree </label>
          <label> <input type="radio" name="q3" checked={q3val === 2} onChange={() => handleQ3(2)} /> disagree </label>
          <label> <input type="radio" name="q3" checked={q3val === 3} onChange={() => handleQ3(3)} /> strongly disagree </label>
        </div>
        <p>{q4}</p>
        <div className="choices">
          <label> <input type="radio" name="q4" checked={q4val === -3} onChange={() => handleQ4(-3)} /> strongly agree </label>
          <label> <input type="radio" name="q4" checked={q4val === -2} onChange={() => handleQ4(-2)} /> agree </label>
          <label> <input type="radio" name="q4" checked={q4val === -1} onChange={() => handleQ4(-1)} /> somewhat agree </label>
          <label> <input type="radio" name="q4" checked={q4val === 0} onChange={() => handleQ4(-0)} /> neutral </label>
          <label> <input type="radio" name="q4" checked={q4val === 1} onChange={() => handleQ4(1)} /> somewhat disagree </label>
          <label> <input type="radio" name="q4" checked={q4val === 2} onChange={() => handleQ4(2)} /> disagree </label>
          <label> <input type="radio" name="q4" checked={q4val === 3} onChange={() => handleQ4(3)} /> strongly disagree </label>
        </div>
        <p>{q5}</p>
        <div className="choices">
          <label> <input type="radio" name="q5" checked={q5val === -3} onChange={() => handleQ5(-3)} /> strongly agree </label>
          <label> <input type="radio" name="q5" checked={q5val === -2} onChange={() => handleQ5(-2)} /> agree </label>
          <label> <input type="radio" name="q5" checked={q5val === -1} onChange={() => handleQ5(-1)} /> somewhat agree </label>
          <label> <input type="radio" name="q5" checked={q5val === 0} onChange={() => handleQ5(0)} /> neutral </label>
          <label> <input type="radio" name="q5" checked={q5val === 1} onChange={() => handleQ5(1)} /> somewhat disagree </label>
          <label> <input type="radio" name="q5" checked={q5val === 2} onChange={() => handleQ5(2)} /> disagree </label>
          <label> <input type="radio" name="q5" checked={q5val === 3} onChange={() => handleQ5(3)} /> strongly disagree </label>
        </div>
        <p>{q6}</p>
        <div className="choices">
          <label> <input type="radio" name="q6" checked={q6val === -3} onChange={() => handleQ6(-3)} /> strongly agree </label>
          <label> <input type="radio" name="q6" checked={q6val === -2} onChange={() => handleQ6(-2)} /> agree </label>
          <label> <input type="radio" name="q6" checked={q6val === -1} onChange={() => handleQ6(-1)} /> somewhat agree </label>
          <label> <input type="radio" name="q6" checked={q6val === 0} onChange={() => handleQ6(0)} /> neutral </label>
          <label> <input type="radio" name="q6" checked={q6val === 1} onChange={() => handleQ6(1)} /> somewhat disagree </label>
          <label> <input type="radio" name="q6" checked={q6val === 2} onChange={() => handleQ6(2)} /> disagree </label>
          <label> <input type="radio" name="q6" checked={q6val === 3} onChange={() => handleQ6(3)} /> strongly disagree </label>
        </div>
        <p>{q7}</p>
        <div className="choices">
          <label> <input type="radio" name="q7" checked={q7val === -3} onChange={() => handleQ7(-3)} /> strongly agree </label>
          <label> <input type="radio" name="q7" checked={q7val === -2} onChange={() => handleQ7(-2)} /> agree </label>
          <label> <input type="radio" name="q7" checked={q7val === -1} onChange={() => handleQ7(-1)} /> somewhat agree </label>
          <label> <input type="radio" name="q7" checked={q7val === 0} onChange={() => handleQ7(0)} /> neutral </label>
          <label> <input type="radio" name="q7" checked={q7val === 1} onChange={() => handleQ7(1)} /> somewhat disagree </label>
          <label> <input type="radio" name="q7" checked={q7val === 2} onChange={() => handleQ7(2)} /> disagree </label>
          <label> <input type="radio" name="q7" checked={q7val === 3} onChange={() => handleQ7(3)} /> strongly disagree </label>
        </div>
        <p>{q8}</p>
        <div className="choices">
          <label> <input type="radio" name="q8" checked={q8val === -3} onChange={() => handleQ8(-3)} /> strongly agree </label>
          <label> <input type="radio" name="q8" checked={q8val === -2} onChange={() => handleQ8(-2)} /> agree </label>
          <label> <input type="radio" name="q8" checked={q8val === -1} onChange={() => handleQ8(-1)} /> somewhat agree </label>
          <label> <input type="radio" name="q8" checked={q8val === 0} onChange={() => handleQ8(0)} /> neutral </label>
          <label> <input type="radio" name="q8" checked={q8val === 1} onChange={() => handleQ8(1)} /> somewhat disagree </label>
          <label> <input type="radio" name="q8" checked={q8val === 2} onChange={() => handleQ8(2)} /> disagree </label>
          <label> <input type="radio" name="q8" checked={q8val === 3} onChange={() => handleQ8(3)} /> strongly disagree </label>
        </div>
        <p>{q9}</p>
        <div className="choices">
          <label> <input type="radio" name="q9" checked={q9val === -3} onChange={() => handleQ9(-3)} /> strongly agree </label>
          <label> <input type="radio" name="q9" checked={q9val === -2} onChange={() => handleQ9(-2)} /> agree </label>
          <label> <input type="radio" name="q9" checked={q9val === -1} onChange={() => handleQ9(-1)} /> somewhat agree </label>
          <label> <input type="radio" name="q9" checked={q9val === 0} onChange={() => handleQ9(0)} /> neutral </label>
          <label> <input type="radio" name="q9" checked={q9val === 1} onChange={() => handleQ9(1)} /> somewhat disagree </label>
          <label> <input type="radio" name="q9" checked={q9val === 2} onChange={() => handleQ9(2)} /> disagree </label>
          <label> <input type="radio" name="q9" checked={q9val === 3} onChange={() => handleQ9(3)} /> strongly disagree </label>
        </div>
        <p>{q10}</p>
        <div className="choices">
          <label> <input type="radio" name="q10" checked={q10val === -3} onChange={() => handleQ10(-3)} /> strongly agree </label>
          <label> <input type="radio" name="q10" checked={q10val === -2} onChange={() => handleQ10(-2)} /> agree </label>
          <label> <input type="radio" name="q10" checked={q10val === -1} onChange={() => handleQ10(-1)} /> somewhat agree </label>
          <label> <input type="radio" name="q10" checked={q10val === 0} onChange={() => handleQ10(0)} /> neutral </label>
          <label> <input type="radio" name="q10" checked={q10val === 1} onChange={() => handleQ10(1)} /> somewhat disagree </label>
          <label> <input type="radio" name="q10" checked={q10val === 2} onChange={() => handleQ10(2)} /> disagree </label>
          <label> <input type="radio" name="q10" checked={q10val === 3} onChange={() => handleQ10(3)} /> strongly disagree </label>
        </div>
        <br />
        {nextButton}

      </div>
    );
  }
  else {
    return (
      <div className="App">
        <h1 className="heading"> Work Style Survey </h1>

        <div> <p>{mbti}</p> {blankText1}</div>
        <div>
          {mbtiInfo} {blankText1}
          <div className="source-text">
            {sourceText}
            <a className="source" href={"https://www.".concat(source)} target="_blank">
              {source}
            </a>
          </div>
          {blankText2}
        </div>

        <button onClick={begin}>
          {btnMessage} Quiz
        </button>
      </div >
    );
  }
}

export default App;
