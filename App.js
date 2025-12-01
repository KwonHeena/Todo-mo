import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  FlatList,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage"; //저장소 사용 선언

const STORAGE_KEY = "MY_LIST_V1"; //스토리지 키 지정

const App = () => {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState([]);
  const [date, setDate] = useState(new Date()); // 현재 날짜 초기값
  const [showPicker, setShowPicker] = useState(false);
  const [photo, setPhoto] = useState(null); // 사진 uri
  const animation = useRef(new Animated.Value(0)).current; // 텍스트 애니메이션 추가
  const emoji = useRef(new Animated.Value(0)).current; // 이모지 애니메이션 추가

  // 투두 스토리지에 로드
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);

        const withAnim = parsed.map((t) => ({
          ...t,
          anima: new Animated.Value(1),
        }));

        setTodos(withAnim);
      }
    } catch (e) {
      console.log("로드 오류:", e);
    }
  };

  // 투두 스토리지에 저장
  useEffect(() => {
    saveTodos();
  }, [todos]);

  const saveTodos = async () => {
    try {
      const withoutAnim = todos.map(({ anima, ...rest }) => rest);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(withoutAnim));
    } catch (e) {
      console.log("저장 오류:", e);
    }
  };

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${y}-${m}-${day}`;
  };

  // 투두 추가
  const addTodo = () => {
    if (!text.trim()) return;
    const newTodo = {
      id: Date.now().toString(),
      title: text.trim(),
      date: formatDate(date),
      photo,
    };
    setTodos([newTodo, ...todos]);
    setText("");
    setPhoto(null);
  };

  const removeTodo = (id) => {
    setTodos(todos.filter((item) => item.id !== id));
  };

  const changeDate = (e, chDate) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    setDate(chDate);
  };

  // 사진찍기
  const getPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.9,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setPhoto(uri);
  };

  // 앨범에서 사진 선택
  const getGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("갤러리 접근 허용 필요");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.9,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setPhoto(uri);
  };

  useEffect(() => {
    animation.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 텍스트 애니메이션
  const tx = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-15, 15],
  });

  useEffect(() => {
    emoji.setValue(0);
    Animated.loop(
      Animated.timing(emoji, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // 이모지 애니메이션
  const ro = emoji.interpolate({
    inputRange: [0, 1], // 0 에서 1로 변할 때
    outputRange: ["0deg", "360deg"], // 변하는 값 알려주기
  });

  const [edit, setEdit] = useState(null);
  const editTodo = (item) => {
    setText(item.title);
    setDate(new Date(item.date));
    setPhoto(item.photo);
    setEdit(item.id);
  };

  const updateTodo = () => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === edit
          ? { ...todo, title: text, photo, date: formatDate(date) }
          : todo
      )
    );
    setPhoto(null);
    setText("");
    setEdit(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Animated.Text
          style={[styles.title, { transform: [{ translateX: tx }] }]}
        >
          Todo List
        </Animated.Text>
        <View style={styles.inner}>
          <View style={styles.todoBox}>
            <View style={styles.rowBox}>
              <TextInput
                placeholder="Add Todo"
                value={text}
                onChangeText={setText}
                style={styles.inputbox}
              />
              <Pressable
                onPress={() => setShowPicker((prev) => !prev)}
                style={styles.dateBox}
              >
                <Text style={styles.dateText}>{formatDate(date)}</Text>
              </Pressable>
            </View>

            {/* 투두 추가 버튼 */}
            <Pressable onPress={edit ? updateTodo : addTodo} style={styles.btn}>
              <Text style={styles.btn_text}>{edit ? "Ok" : "Add"}</Text>
            </Pressable>
          </View>

          {/* 사진 추가 버튼 */}
          <View style={styles.photo_wrap}>
            <Pressable style={styles.photo} onPress={getPhoto}>
              <Text>Add Photo</Text>
            </Pressable>
            <Pressable style={styles.photo} onPress={getGallery}>
              <Text>Gallery</Text>
            </Pressable>
          </View>
          <View>
            {photo && (
              <View>
                <Text
                  style={{ marginTop: 10, fontSize: 12, color: "#a0a0a0ff" }}
                >
                  이미지 미리보기
                </Text>
                <View style={styles.ImagePicker}>
                  <Image
                    source={{ uri: photo }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </View>
              </View>
            )}
          </View>

          {/* showPicker가 참이면   */}
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={changeDate}
            />
          )}

          <View style={styles.addList}>
            <FlatList
              data={todos}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    paddingVertical: 20,
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Animated.Text
                      style={{
                        transform: [{ rotateY: ro }],
                        marginRight: 5,
                        marginTop: 2,
                      }}
                    >
                      💜
                    </Animated.Text>
                    <Text style={{ fontSize: 18 }}>할일을 추가해보세요</Text>
                    <Animated.Text
                      style={{
                        transform: [{ rotateY: ro }],
                        marginLeft: 5,
                        marginTop: 2,
                      }}
                    >
                      💜
                    </Animated.Text>
                  </View>
                </View>
              }
              renderItem={({ item, index }) => (
                <View style={styles.item}>
                  <View style={styles.titleBox}>
                    <Text style={styles.todo_index}>{index + 1}</Text>
                    <Text style={styles.todo_title}>{item.title}</Text>
                  </View>
                  {item.photo && (
                    <View style={styles.ImagePicker}>
                      <Image
                        source={{ uri: item.photo }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </View>
                  )}

                  <View style={styles.btnBox}>
                    <Text style={styles.date}>{item.date}</Text>
                    <Pressable onPress={() => removeTodo(item.id)}>
                      <Text style={styles.delete}>X</Text>
                    </Pressable>
                    <Pressable onPress={() => editTodo(item)}>
                      <Text style={[styles.delete, { fontSize: 11 }]}>
                        수정
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFB",
    padding: 20,
    alignItems: "center",
  },
  inner: {
    flex: 1,
    width: "100%",
  },
  box: {
    flex: 1,
    width: "100%",
    marginTop: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FF6B81",
    marginBottom: 20,
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.05)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  todoBox: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 20,
  },
  rowBox: {
    width: "75%",
  },
  inputbox: {
    width: "100%",
    height: 50,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0D7F2",
    paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  dateBox: {
    marginTop: 7,
    width: "100%",
    height: 50,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0D7F2",
    paddingHorizontal: 20,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  dateText: {
    fontSize: 14,
    color: "#7D6E83",
  },
  btn: {
    backgroundColor: "#7FB3FF",
    width: 70,
    height: 105,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7FB3FF",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  btn_text: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  photo_wrap: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    justifyContent: "center",
  },
  photo: {
    backgroundColor: "#FFD3B6",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    shadowColor: "#FFB380",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  titleBox: {
    flex: 1,
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  btnBox: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  addList: {
    width: "100%",
    flex: 1,
    marginTop: 15,
  },
  item: {
    width: "100%",
    backgroundColor: "#F3F0FF",
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    flexDirection: "column",
    justifyContent: "space-between",
    shadowColor: "#D1C4E9",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  todo_index: {
    fontSize: 14,
    color: "#A5A1B9",
    marginBottom: 6,
  },
  todo_title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4B3F72",
    marginBottom: 6,
  },
  delete: {
    width: 25,
    height: 25,
    borderRadius: 5,
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: "#FF6B6B",
    color: "#fff",
    lineHeight: 25,
    marginLeft: 5,
  },
  date: {
    fontSize: 12,
    color: "#7D6E83",
    marginTop: 5,
    textAlign: "right",
  },
  ImagePicker: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#E8F0FF",
    marginTop: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#AFCBFF",
  },
});

export default App;
