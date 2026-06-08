import { API_URL } from "./config";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [wordSets, setWordSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [selectedSetTitle, setSelectedSetTitle] = useState("");
  const [words, setWords] = useState([]);
  const [inputText, setInputText] = useState("");

  const [quizWord, setQuizWord] = useState(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [newSetTitle, setNewSetTitle] = useState("");
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [quizWords, setQuizWords] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);  

  const [editingWordId, setEditingWordId] = useState(null);
  const [editEnglish, setEditEnglish] = useState("");
  const [editKorean, setEditKorean] = useState("");

  const [quizMode, setQuizMode] = useState("normal");

  const [editingWordSetId, setEditingWordSetId] = useState(null);
  const [editWordSetTitle, setEditWordSetTitle] = useState("");

  const [quizType, setQuizType] = useState("subjective");
  const [choices, setChoices] = useState([]);

  const [studyWords, setStudyWords] = useState([]);
  const [currentStudyIndex, setCurrentStudyIndex] = useState(0);

  const [studyHistories, setStudyHistories] = useState([]);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [authMode, setAuthMode] = useState("login");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [wordSetSearchText, setWordSetSearchText] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    loadWordSets();
  }, []);

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const loadWordSets = () => {
    fetch("${API_URL}/api/wordsets")
      .then((res) => res.json())
      .then((data) => setWordSets(data));
  };

  const openWordSet = (wordSet) => {
    setSelectedSetId(wordSet.id);
    setSelectedSetTitle(wordSet.title);
    setPage("detail");

    fetch(`${API_URL}/api/wordsets/${wordSet.id}/words`)
      .then((res) => res.json())
      .then((data) => setWords(data));
  };

  const addWords = () => {
    if (!inputText.trim()) return alert("추가할 단어를 입력하세요.");

    fetch("${API_URL}/api/words/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wordSetId: selectedSetId,
        text: inputText,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setInputText("");
        openWordSet({ id: selectedSetId, title: selectedSetTitle });
      });
  };

  const deleteWord = (id) => {
    fetch(`${API_URL}/api/words/${id}`, {
      method: "DELETE",
    }).then(() => {
      openWordSet({
        id: selectedSetId,
        title: selectedSetTitle,
      });
    });
  };

  const startQuiz = (type = "subjective") => {
    setQuizMode("normal");
    setQuizType(type);

    if (!selectedSetId) {
      alert("단어장을 먼저 선택하세요.");
      return;
    }

    fetch(`${API_URL}/api/wordsets/${selectedSetId}/words`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) {
          alert("이 단어장에는 단어가 없습니다.");
          return;
        }

        const shuffledWords = shuffleArray(data);

        setQuizWords(shuffledWords);
        setCurrentQuizIndex(0);
        setQuizWord(shuffledWords[0]);
        setChoices(generateChoices(shuffledWords[0], shuffledWords));

        setScore(0);
        setQuestionCount(0);
        setFinished(false);
        setAnswer("");
        setResult(null);
        setPage("quiz");
      });
  };

  const nextQuiz = () => {
    const nextIndex = currentQuizIndex + 1;

    if (nextIndex >= quizWords.length) {
      saveStudyHistory();
      setFinished(true);
      setQuizWord(null);
      setResult(null);
      setAnswer("");
      return;
    }

    const nextWord = quizWords[nextIndex];

    setCurrentQuizIndex(nextIndex);

    setQuizWord(nextWord);

    setChoices(
      generateChoices(
        nextWord,
        quizWords
      )
    );

    setAnswer("");

    setResult(null);
  };

  const checkAnswer = (selectedAnswer = answer) => {
    if (!selectedAnswer.trim()) return alert("답을 입력하세요.");

    fetch("${API_URL}/api/words/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wordId: quizWord.id,
        answer: selectedAnswer,
        reviewMode: quizMode === "wrong",
        userId: currentUser.id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResult(data);

        setQuestionCount((prev) => prev + 1);

        if (data.correct) {
          setScore((prev) => prev + 1);

          if (quizMode === "wrong" && quizWord.wrongAnswerId) {
            fetch(`${API_URL}/api/wrong-answers/${quizWord.wrongAnswerId}`, {
              method: "DELETE",
            });
          }
        }
      });
  };

  const loadWrongAnswers = () => {
    fetch(`${API_URL}/api/wrong-answers?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        const uniqueWrongAnswers = data.filter(
          (wrong, index, self) =>
            index === self.findIndex((w) => w.wordId === wrong.wordId)
        );

        setWrongAnswers(uniqueWrongAnswers);
        setPage("wrong");
      });
  };

  const startWrongAnswerQuiz = () => {

    if (wrongAnswers.length === 0) {
      alert("오답이 없습니다.");
      return;
    }

    const wrongWords = wrongAnswers.map((wrong) => ({
      id: wrong.wordId,
      wrongAnswerId: wrong.wrongAnswerId,
      english: wrong.english,
      korean: wrong.correctAnswer,
    }));

    setQuizMode("wrong");

    setQuizType("subjective");
    
    setQuizWords(wrongWords);

    setCurrentQuizIndex(0);

    setQuizWord(wrongWords[0]);

    setScore(0);

    setQuestionCount(0);

    setFinished(false);

    setResult(null);

    setAnswer("");

    setPage("quiz");
  };

  const deleteWrongAnswer = (wordId) => {
    fetch(`${API_URL}/api/wrong-answers/word/${wordId}?userId=${currentUser.id}`, {
      method: "DELETE",
    }).then(() => {
      loadWrongAnswers();
    });
  };

  const createWordSet = () => {
    if (!newSetTitle.trim()) {
      alert("단어장 이름을 입력하세요.");
      return;
    }

    fetch("${API_URL}/api/wordsets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newSetTitle,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewSetTitle("");
        loadWordSets();
      });
  };

  const startEditWord = (word) => {
  setEditingWordId(word.id);
  setEditEnglish(word.english);
  setEditKorean(word.korean);
  };  

  const updateWord = () => {
    fetch(`${API_URL}/api/words/${editingWordId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        english: editEnglish,
        korean: editKorean,
      }),
    }).then(() => {
      setEditingWordId(null);
      setEditEnglish("");
      setEditKorean("");

      openWordSet({
        id: selectedSetId,
        title: selectedSetTitle,
      });
    });
  };

  const deleteWordSet = (id) => {
    const confirmed = window.confirm(
      "정말 이 단어장을 삭제하시겠습니까?\n단어장 안의 단어들도 함께 삭제될 수 있습니다."
    );

    if (!confirmed) {
      return;
    }

    fetch(`${API_URL}/api/wordsets/${id}`, {
      method: "DELETE",
    }).then(() => {
      loadWordSets();
    });
  };

  const startEditWordSet = (wordSet) => {
    setEditingWordSetId(wordSet.id);
    setEditWordSetTitle(wordSet.title);
  };

  const updateWordSet = () => {
    fetch(
      `${API_URL}/api/wordsets/${editingWordSetId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editWordSetTitle,
        }),
      }
    ).then(() => {

      setEditingWordSetId(null);

      setEditWordSetTitle("");

      loadWordSets();
    });
  };

  const generateChoices = (correctWord, allWords) => {

    const wrongChoices = allWords
      .filter((w) => w.id !== correctWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const result = [
      correctWord.korean,
      ...wrongChoices.map((w) => w.korean),
    ];

    return result.sort(() => Math.random() - 0.5);
  };

  const startStudy = () => {
    if (!selectedSetId) {
      alert("단어장을 먼저 선택하세요.");
      return;
    }

    fetch(`${API_URL}/api/wordsets/${selectedSetId}/words`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) {
          alert("이 단어장에는 단어가 없습니다.");
          return;
        }

        setStudyWords(data);
        setCurrentStudyIndex(0);
        setPage("study");
      });
  };

  const saveStudyHistory = () => {
    fetch("${API_URL}/api/histories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quizMode: quizMode,
        quizType: quizType,
        score: score,
        totalQuestion: quizWords.length,
        user: {
          id: currentUser.id,
        },
      }),
    });
  };

  const loadStudyHistories = () => {
    fetch("${API_URL}/api/histories")
      .then((res) => res.json())
      .then((data) => {
        setStudyHistories(data.slice(0, 50));
        setPage("history");
      });
  };

  const login = () => {
    fetch("${API_URL}/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: loginUsername,
        password: loginPassword,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("로그인 실패");
        }
        return res.json();
      })
      .then((data) => {
        setCurrentUser(data);
        localStorage.setItem("currentUser", JSON.stringify(data));
        setPage("home");
      })
      .catch(() => {
        alert("아이디 또는 비밀번호가 틀렸습니다.");
      });
  };

  const register = () => {
    if (!registerUsername.trim() || !registerPassword.trim()) {
      alert("아이디와 비밀번호를 입력하세요.");
      return;
    }

    fetch("${API_URL}/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: registerUsername,
        password: registerPassword,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("회원가입 실패");
        }
        return res.json();
      })
      .then(() => {
        alert("회원가입 성공! 로그인하세요.");
        setAuthMode("login");
        setLoginUsername(registerUsername);
        setLoginPassword("");
        setRegisterUsername("");
        setRegisterPassword("");
      })
      .catch(() => {
        alert("이미 존재하는 아이디이거나 회원가입에 실패했습니다.");
      });
  };

  const isTeacher = currentUser?.role === "TEACHER";

  const filteredWordSets = wordSets.filter((wordSet) =>
    wordSet.title.toLowerCase().includes(wordSetSearchText.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="loginPage">
        <div className="loginBox">
          <h1>WordApp</h1>

          {authMode === "login" ? (
            <>
              <p>로그인 후 이용하세요.</p>

              <input
                className="textInput"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="아이디"
              />

              <input
                className="textInput"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="비밀번호"
              />

              <button className="primaryBtn" onClick={login}>
                로그인
              </button>

              <p>
                계정이 없나요?{" "}
                <button
                  className="linkBtn"
                  onClick={() => setAuthMode("register")}
                >
                  회원가입
                </button>
              </p>
            </>
          ) : (
            <>
              <p>새 계정을 만드세요.</p>

              <input
                className="textInput"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                placeholder="아이디"
              />

              <input
                className="textInput"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="비밀번호"
              />

              <button className="primaryBtn" onClick={register}>
                회원가입
              </button>

              <p>
                이미 계정이 있나요?{" "}
                <button
                  className="linkBtn"
                  onClick={() => setAuthMode("login")}
                >
                  로그인
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1 onClick={() => setPage("home")}>WordApp</h1>
        <button onClick={() => setPage("home")}>단어장</button>
        <button onClick={loadWrongAnswers}>오답노트</button>
        {isTeacher && (
          <button onClick={loadStudyHistories}>학습기록</button>
        )}
        <span>{currentUser.username} ({currentUser.role})</span>

        <button
          onClick={() => {
            localStorage.removeItem("currentUser");
            setCurrentUser(null);
            setPage("home");
          }}
        >
          로그아웃
        </button>
      </header>

      {page === "home" && (
        <main className="page">
          <h2>단어장 목록</h2>
          <p className="sub">학습할 단어장을 선택하세요.</p>
          <input
            className="textInput"
            value={wordSetSearchText}
            onChange={(e) => setWordSetSearchText(e.target.value)}
            placeholder="단어장 이름 검색"
          />
          {isTeacher && (
            <section className="panel">
              <h3>새 단어장 만들기</h3>

              <input
                value={newSetTitle}
                onChange={(e) => setNewSetTitle(e.target.value)}
                placeholder="예: 중간고사 단어장"
                className="textInput"
              />

              <button className="primaryBtn" onClick={createWordSet}>
                단어장 생성
              </button>
            </section>
          )}
          <br></br>
          <div className="cardGrid">
            {filteredWordSets.map((wordSet) => (
              <div
                key={wordSet.id}
                className="card"
                onClick={() => openWordSet(wordSet)}
              >
                <p>클릭해서 단어 보기</p>

                <h3>{wordSet.title}</h3>

                {isTeacher && (
                  <>
                  {editingWordSetId === wordSet.id ? (
                    <>
                      <input
                        value={editWordSetTitle}
                        onChange={(e) =>
                          setEditWordSetTitle(e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />

                      <button
                        className="smallSaveBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateWordSet();
                        }}
                      >
                        저장
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="smallSaveBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditWordSet(wordSet);
                        }}
                      >
                        수정
                      </button>
                    </>
                  )}

                  <button
                    className="smallDangerBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWordSet(wordSet.id);
                    }}
                  >
                    삭제
                  </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </main>
      )}

      {page === "detail" && (
        <main className="page">
          <button className="backBtn" onClick={() => setPage("home")}>
            ← 뒤로가기
          </button>

          <h2>{selectedSetTitle}</h2>
          <p className="sub">단어를 추가하거나 학습을 시작하세요.</p>

          {isTeacher && (
            <section className="panel">
              <h3>단어 추가</h3>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={"pretty 예쁜\nIn front of 앞에\nlove 사랑하다 정말 좋다"}
              />
              <button className="primaryBtn" onClick={addWords}>
                단어 추가
              </button>
            </section>
          )}

          <section className="panel">
            <div className="sectionHeader">
              <h3>단어 목록</h3>
              <div className="modeButtons">
                <button className="primaryBtn" onClick={startStudy}>
                  학습
                </button>

                <button
                  className="primaryBtn"
                  onClick={() => startQuiz("multiple")}
                >
                  객관식
                </button>

                <button
                  className="primaryBtn"
                  onClick={() => startQuiz("subjective")}
                >
                  주관식
                </button>
              </div>
            </div>

            <div className="wordList">
              {words.map((word) => (
                <div key={word.id} className="wordItem">
                  {editingWordId === word.id ? (
                    <>
                      <input
                        className="smallInput"
                        value={editEnglish}
                        onChange={(e) => setEditEnglish(e.target.value)}
                      />

                      <input
                        className="smallInput"
                        value={editKorean}
                        onChange={(e) => setEditKorean(e.target.value)}
                      />

                      <button className="smallSaveBtn" onClick={updateWord}>
                        저장
                      </button>

                      <button className="smallDangerBtn" onClick={() => setEditingWordId(null)}>
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <strong>{word.english}</strong>
                      <span>{word.korean}</span>
                      
                      {isTeacher && (
                        <>
                        <button className="smallSaveBtn" onClick={() => startEditWord(word)}>
                          수정
                        </button>

                        <button className="smallDangerBtn" onClick={() => deleteWord(word.id)}>
                          삭제
                        </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      )}
      
      {page === "study" && (
        <main className="page quizPage">
          <button className="backBtn" onClick={() => setPage("detail")}>
            ← 단어장으로
          </button>

          <h2>학습</h2>

          {studyWords.length > 0 && (
            <div className="quizCard">
              <p>
                {currentStudyIndex + 1} / {studyWords.length}
              </p>

              <h1>{studyWords[currentStudyIndex].english}</h1>

              <h2>{studyWords[currentStudyIndex].korean}</h2>

              <div className="studyNavButtons">
                <button
                  className="primaryBtn"
                  onClick={() => {
                    if (currentStudyIndex === 0) {
                      setPage("detail");
                    } else {
                      setCurrentStudyIndex(currentStudyIndex - 1);
                    }
                  }}
                >
                  {currentStudyIndex === 0 ? "단어장으로" : "이전"}
                </button>

                <button
                  className="primaryBtn"
                  onClick={() => {
                    if (currentStudyIndex === studyWords.length - 1) {
                      setPage("detail");
                    } else {
                      setCurrentStudyIndex(currentStudyIndex + 1);
                    }
                  }}
                >
                  {currentStudyIndex === studyWords.length - 1 ? "단어장으로" : "다음"}
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {page === "quiz" && (
        <main className="page quizPage">
          {quizMode !== "wrong" && (
            <button className="backBtn" onClick={() => setPage("detail")}>
              ← 단어장으로
            </button>
          )}

          <h2>
            {quizMode === "wrong"
              ? "오답 복습"
              : quizType === "multiple"
              ? "객관식 퀴즈"
              : "주관식 퀴즈"}
          </h2>

          {!finished && quizWord && (
            <div className="quizCard">
              <p>
                진행률: {questionCount} / {quizWords.length} &nbsp; 점수: {score}
              </p>

              <br />

              <p className="sub">다음 단어의 뜻을 입력하세요.</p>

              <h1>{quizWord.english}</h1>

              {quizType === "multiple" && !result && (
                <div className="choiceContainer">
                  {choices.map((choice) => (
                    <button
                      key={choice}
                      className="choiceButton"
                      onClick={() => {
                        setAnswer(choice);
                        checkAnswer(choice);
                      }}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              )}
              
              {quizType === "subjective" && !result && (
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    result ? nextQuiz() : checkAnswer();
                  }
                }}
                placeholder="뜻 입력"
              />
              )}

              {quizType === "subjective" && !result && (
                <button className="primaryBtn" onClick={() => checkAnswer()}>
                  제출
                </button>
              )}

              {result && (
                <div className={result.correct ? "correct" : "wrong"}>
                  {result.correct
                    ? "정답! 🎉"
                    : `오답 😥 정답: ${result.correctAnswer}`}

                  <button onClick={nextQuiz}>다음 문제</button>
                </div>
              )}
            </div>
          )}

          {finished && (
            <div className="quizCard">
              <h2>학습 완료 🎉</h2>

              <h3>
                총 점수: {score} / {quizWords.length}
              </h3>

              <p>정답률: {Math.round((score / quizWords.length) * 100)}%</p>

              <button
                className="primaryBtn"
                onClick={() => {

                  if (quizMode === "wrong") {
                    startWrongAnswerQuiz();
                  } else {
                    startQuiz(quizType);
                  }

                }}
              >
                다시하기
              </button>
            </div>
          )}
        </main>
      )}

      {page === "wrong" && (
        <main className="page">
          <button className="backBtn" onClick={() => setPage("home")}>
            ← 홈으로
          </button>
          <br></br>
          <button
            className="primaryBtn"
            onClick={startWrongAnswerQuiz}
          >
            오답 다시 풀기
          </button>
          
          <h2><br></br>오답노트</h2>
          <p className="sub">틀린 단어들을 다시 확인하세요.</p>

          <section className="panel">
            {wrongAnswers.length === 0 ? (
              <p>아직 오답이 없습니다.</p>
            ) : (
              <div className="wordList">
                {wrongAnswers.map((wrong) => (
                  <div key={wrong.wordId} className="wordItem">
                    <strong>{wrong.english}</strong>
                    <span>{wrong.correctAnswer}</span>

                    <button
                      className="smallDangerBtn"
                      onClick={() => deleteWrongAnswer(wrong.wordId)}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {page === "history" && (
        <main className="page">
          <button className="backBtn" onClick={() => setPage("home")}>
            ← 홈으로
          </button>

          <h2>학습기록</h2>
          <p className="sub">최근 학습 결과를 확인하세요.</p>

          <section className="panel">
            {studyHistories.length === 0 ? (
              <p>아직 학습기록이 없습니다.</p>
            ) : (
              <div className="wordList">
                {studyHistories.map((history) => (
                  <div key={history.id} className="historyItem">
                    <strong>{history.username}</strong>

                    <span>
                      {history.quizMode === "wrong"
                        ? "오답 복습"
                        : history.quizType === "multiple"
                        ? "객관식"
                        : "주관식"}
                    </span>

                    <small>
                      {new Date(history.createdAt).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>

                    <span>
                      {history.score} / {history.totalQuestion}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

export default App;