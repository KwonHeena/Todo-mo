import React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

const App = () => {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState([]);
  const [date, setDate] = useState(new Date()); // 현재 날짜 초기값
  const [showPicker, setShowPicker] = useState(false);
  const [photo, setPhoto] = useState(null); // 사진 uri

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
    if (result.canceled) return alert("카메라 접근 허용 필요");
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

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Todo List</Text>
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
            <Pressable onPress={addTodo} style={styles.btn}>
              <Text style={styles.btn_text}>Add</Text>
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
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Text>할일을 추가하세요!</Text>
                </View>
              }
              renderItem={({ item, index }) => (
                <Pressable
                  onLongPress={() => removeTodo(item.id)}
                  style={styles.item}
                >
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
                  <View style={styles.titleBox}>
                    <Text style={styles.todo_index}>{index + 1}</Text>
                    <Text style={styles.todo_title}>{item.title}</Text>
                  </View>
                  <View style={styles.btnBox}>
                    <Text style={styles.delete}>X</Text>
                    <Text style={styles.date}>{item.date}</Text>
                  </View>
                </Pressable>
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
    backgroundColor: "#FFF8F1",
    padding: 20,
    alignItems: "center",
  },

  box: {
    width: "100%",
    marginTop: 60,
    alignItems: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#E79AB5",
    marginBottom: 15,
    letterSpacing: 1,
  },

  todoBox: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  rowBox: {
    width: "75%",
  },

  inputbox: {
    width: "100%",
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2D5C4",
    paddingHorizontal: 15,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  dateBox: {
    marginTop: 7,
    width: "100%",
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2D5C4",
    paddingHorizontal: 15,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  dateText: {
    fontSize: 14,
    color: "#B08884",
  },

  btn: {
    backgroundColor: "#FFCCD2",
    paddingHorizontal: 20,
    height: 90,
    borderRadius: 20,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
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
  },

  photo: {
    backgroundColor: "#FFE8E0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  titleBox: {
    flex: 1,
    justifyContent: "space-between",
  },
  btnBox: {
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 5,
  },
  addList: {
    flexWrap: "wrap",
    width: "100%",
    height: "100%",
    marginTop: 10,
  },

  item: {
    flexWrap: "wrap",
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 15,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  todo_index: {
    fontSize: 14,
    color: "#bdbdbdff",
    marginBottom: 5,
  },
  todo_title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6D5D56",
  },

  delete: {
    width: 26,
    height: 26,
    borderRadius: 8,
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: "#FFD7E1",
    color: "#85586F",
    lineHeight: 26,
  },

  date: {
    fontSize: 12,
    color: "#B9A1A0",
    marginTop: 5,
    textAlign: "right",
  },

  ImagePicker: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#FFF0F7",
  },
});

export default App;
