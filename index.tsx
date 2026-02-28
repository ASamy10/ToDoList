import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';

// --- TYPESCRIPT INTERFACES ---
interface MediaAttachment {
  uri: string;
  type: 'image';
  name?: string;
}

interface Task {
  key: string;
  title: string;
  description: string;
  completed: boolean;
  media: MediaAttachment | null;
}

export default function App() {
  const [title, setTitle] = useState<string>(''); 
  const [description, setDescription] = useState<string>('');
  const [editingKey, setEditingKey] = useState<string | null>(null); 
  const [tasks, setTasks] = useState<Task[]>([]);              
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); 
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  const [selectedMedia, setSelectedMedia] = useState<MediaAttachment | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  useEffect(() => {
    setFontsLoaded(true); 
  }, []);

  // --- IMAGE PICKER FUNCTION ---
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allows images now
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedMedia({ 
        uri: result.assets[0].uri, 
        type: 'image',
        name: result.assets[0].fileName || 'Image File'
      });
    }
  };

  // --- TASK LOGIC FUNCTIONS ---
  const handleSaveTask = () => {
    if (title.trim().length === 0) return; 

    if (editingKey) {
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.key === editingKey ? { ...task, title, description, media: selectedMedia } : task
        )
      );
      setEditingKey(null); 
    } else {
      setTasks(currentTasks => [
        ...currentTasks, 
        { key: Math.random().toString(), title, description, completed: false, media: selectedMedia }
      ]);
    }
    setTitle(''); 
    setDescription('');
    setSelectedMedia(null);
  };

  const handleDeleteTask = (taskKey: string) => {
    setTasks(currentTasks => currentTasks.filter(task => task.key !== taskKey));
  };

  const handleToggleComplete = (taskKey: string) => {
    setTasks(currentTasks => 
      currentTasks.map(task => task.key === taskKey ? { ...task, completed: !task.completed } : task)
    );
  };

  const handleEditTask = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description);
    setSelectedMedia(task.media);
    setEditingKey(task.key);
  };

  if (!fontsLoaded) return <ActivityIndicator size="large" color="#6366F1" style={{ flex: 1 }} />;

  return (
    <KeyboardAvoidingView style={[styles.container, isDarkMode && darkStyles.container]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={[styles.headerTitle, isDarkMode && darkStyles.textMain]}>My Tasks</Text>
          <Text style={[styles.headerSubtitle, isDarkMode && darkStyles.textMuted]}>Manage your workload</Text>
        </View>
        <TouchableOpacity style={[styles.themeToggle, isDarkMode && darkStyles.themeToggleDark]} onPress={() => setIsDarkMode(!isDarkMode)}>
          <Text style={styles.emojiText}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* Input Form */}
      <View style={[styles.inputCard, isDarkMode && darkStyles.card]}>
        <View style={styles.inputWrapper}>
          <TextInput style={[styles.textInput, isDarkMode && darkStyles.textMain]} placeholder="Task Title..." placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"} onChangeText={setTitle} value={title} />
          <View style={[styles.divider, isDarkMode && darkStyles.divider]} />
          <TextInput style={[styles.textInput, styles.descriptionInput, isDarkMode && darkStyles.textMuted]} placeholder="Description (Optional)" placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"} onChangeText={setDescription} value={description} multiline />
          
          {/* Single Image Upload Button */}
          <View style={styles.mediaButtonsRow}>
             <TouchableOpacity style={styles.mediaBtn} onPress={pickImage}>
               <Text style={styles.mediaBtnText}>📷 Add Photo</Text>
             </TouchableOpacity>
          </View>
          
          {selectedMedia && <Text style={[styles.attachmentText, isDarkMode && darkStyles.textMuted]}>📎 Attached: Image</Text>}
        </View>
        <TouchableOpacity style={[styles.addButton, editingKey && styles.saveButton]} onPress={handleSaveTask}>
          <Text style={styles.addButtonText}>{editingKey ? 'Save' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      {/* List Area */}
      <View style={styles.listContainer}>
        <FlatList
          data={tasks}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.listItem, isDarkMode && darkStyles.card, item.completed && (isDarkMode ? darkStyles.listItemCompleted : styles.listItemCompleted)]} onPress={() => setViewingTask(item)}>
              <View style={styles.taskContent}>
                <TouchableOpacity onPress={() => handleToggleComplete(item.key)} style={[styles.checkbox, isDarkMode && darkStyles.checkbox, item.completed && styles.checkboxCompleted]}>
                  {item.completed && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <View style={styles.textContent}>
                  <Text style={[styles.listTitle, isDarkMode && darkStyles.textMain, item.completed && (isDarkMode ? darkStyles.textCompleted : styles.textCompleted)]}>{item.title}</Text>
                  {item.description ? <Text numberOfLines={2} style={[styles.listDescription, isDarkMode && darkStyles.textMuted, item.completed && (isDarkMode ? darkStyles.textCompleted : styles.textCompleted)]}>{item.description}</Text> : null}
                  {item.media && <Text style={styles.mediaIndicatorText}>📷 Image attached</Text>}
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleEditTask(item)} style={[styles.actionIcon, isDarkMode && darkStyles.actionIcon]}><Text style={styles.emojiText}>✏️</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteTask(item.key)} style={[styles.actionIcon, isDarkMode && darkStyles.actionIcon]}><Text style={styles.emojiText}>🗑️</Text></TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>

      {/* FULL VIEW MODAL */}
      <Modal visible={viewingTask !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setViewingTask(null)}>
        <View style={[styles.modalContainer, isDarkMode && darkStyles.container]}>
          <View style={[styles.modalHeader, isDarkMode && darkStyles.card]}>
            <Text style={[styles.modalHeaderTitle, isDarkMode && darkStyles.textMain]}>Task Details</Text>
            <TouchableOpacity onPress={() => setViewingTask(null)}><Text style={styles.closeButtonText}>Done</Text></TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={[styles.modalTitle, isDarkMode && darkStyles.textMain]}>{viewingTask?.title}</Text>
            <Text style={[styles.modalFullDescription, isDarkMode && darkStyles.textMuted]}>{viewingTask?.description || "No description provided."}</Text>

            {/* THE IMAGE VIEWER */}
            {viewingTask?.media && viewingTask.media.type === 'image' && (
              <View style={[styles.mediaViewer, isDarkMode && darkStyles.card]}>
                <Text style={[styles.mediaViewerTitle, isDarkMode && darkStyles.textMain]}>Attached Photo:</Text>
                <Image source={{ uri: viewingTask.media.uri }} style={styles.previewMedia} resizeMode="contain" />
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

// --- LIGHT THEME STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', paddingTop: 60, paddingHorizontal: 20 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: '#111827', fontSize: 32, fontWeight: '800' },
  headerSubtitle: { color: '#6B7280', fontSize: 16, marginTop: 4 },
  themeToggle: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 50, elevation: 2 },
  emojiText: { fontSize: 16 },
  
  inputCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 8, marginBottom: 20, elevation: 3, alignItems: 'stretch' },
  inputWrapper: { flex: 1, paddingRight: 8 },
  textInput: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#1F2937' },
  descriptionInput: { fontSize: 14, color: '#4B5563', maxHeight: 80 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 12 },
  
  mediaButtonsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 10 },
  mediaBtn: { backgroundColor: '#E0E7FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start' },
  mediaBtnText: { color: '#4338CA', fontSize: 12, fontWeight: '600' },
  attachmentText: { fontSize: 12, color: '#059669', paddingHorizontal: 12, paddingBottom: 8, fontWeight: '500' },
  
  addButton: { backgroundColor: '#6366F1', borderRadius: 12, width: 70, justifyContent: 'center', alignItems: 'center' },
  saveButton: { backgroundColor: '#10B981' },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  
  listContainer: { flex: 1 },
  listItem: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1 },
  listItemCompleted: { backgroundColor: '#F9FAFB', opacity: 0.7 },
  taskContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxCompleted: { backgroundColor: '#10B981', borderColor: '#10B981' },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  textContent: { flex: 1 },
  listTitle: { color: '#111827', fontSize: 16, fontWeight: '600' },
  listDescription: { color: '#6B7280', fontSize: 14, marginTop: 4 },
  textCompleted: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  mediaIndicatorText: { fontSize: 12, color: '#6366F1', marginTop: 4, fontWeight: '500' },
  
  actionButtons: { flexDirection: 'row', marginLeft: 10 },
  actionIcon: { padding: 8, marginLeft: 4, backgroundColor: '#F3F4F6', borderRadius: 8 },

  /* MODAL STYLES */
  modalContainer: { flex: 1, backgroundColor: '#F3F4F6' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', alignItems: 'center' },
  modalHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  closeButtonText: { color: '#6366F1', fontSize: 16, fontWeight: '600' },
  modalScroll: { padding: 24 },
  modalTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 12 },
  modalFullDescription: { fontSize: 16, color: '#4B5563', lineHeight: 24, marginBottom: 24 },
  mediaViewer: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, elevation: 2 },
  mediaViewerTitle: { fontSize: 14, fontWeight: 'bold', color: '#6B7280', marginBottom: 12 },
  previewMedia: { width: '100%', height: 300, borderRadius: 8, backgroundColor: '#F3F4F6' }
});

// --- DARK THEME OVERRIDES ---
const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#111827' },
  themeToggleDark: { backgroundColor: '#1F2937' },
  card: { backgroundColor: '#1F2937', borderBottomColor: '#374151' },
  textMain: { color: '#F9FAFB' },
  textMuted: { color: '#9CA3AF' },
  divider: { backgroundColor: '#374151' },
  actionIcon: { backgroundColor: '#374151' },
  checkbox: { borderColor: '#4B5563' },
  listItemCompleted: { backgroundColor: '#111827', opacity: 0.5 },
  textCompleted: { textDecorationLine: 'line-through', color: '#4B5563' }
});