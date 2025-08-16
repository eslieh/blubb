import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Copy,
  Check,
  Users,
  Mic,
  MicOff,
  Volume2,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
import Header from "../components/Header";
import styles from "@/styles/App.module.css";
import roomStyles from "../components/Room.module.css";

export default function Room() {
  const router = useRouter();
  const { id } = router.query;
  const [room, setRoom] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const user = {
    name: "Victor",
    email: "victor@blubb.app",
    image:
      "https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg",
  };

  // Mock participant data
  const participants = [
    {
      id: 1,
      name: "Alex Chen",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      isSpeaking: false,
    },
    {
      id: 2,
      name: "Sarah Kim",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=150&h=150&fit=crop&crop=face",
      isSpeaking: true,
    },
    {
      id: 3,
      name: "Marcus Johnson",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      isSpeaking: false,
    },
    {
      id: 4,
      name: "Elena Rodriguez",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      isSpeaking: false,
    },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const scaleOnHover = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  };

  // Load room data when component mounts and id is available
  useEffect(() => {
    if (id) {
      // Simulate loading room data
      setTimeout(() => {
        setRoom({
          id: id,
          name: "Coachella",
          description: "Music and Arts Festival held in Indio, California",
          creator: "Steven Barrett",
          participants: participants.length + 1, // +1 for current user
          url: `${window.location.origin}/app/room/${id}`,
          createdAt: new Date().toISOString(),
          isActive: true,
          activeHours: "35h",
          onlineUsers: participants.length + 1,
        });
        setIsLoading(false);
      }, 1000);
    }
  }, [id]);

  const copyRoomUrl = async () => {
    if (room) {
      try {
        await navigator.clipboard.writeText(room.url);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } catch (err) {
        console.error("Failed to copy URL:", err);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const goBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading Room - Blubb.</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className={styles.container}>
          <Header user={user} />
          <section className={styles.hero}>
            <motion.div
              className={roomStyles.loadingContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.h1 className={roomStyles.loadingTitle}>
                Loading Room... ⏳
              </motion.h1>
              <motion.p className={roomStyles.loadingSubtext}>
                Getting everything ready for you!
              </motion.p>
            </motion.div>
          </section>
        </div>
      </>
    );
  }

  if (!room) {
    return (
      <>
        <Head>
          <title>Room Not Found - Blubb.</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className={styles.container}>
          <Header user={user} />
          <section className={styles.hero}>
            <motion.div
              className={roomStyles.errorContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.h1 className={roomStyles.errorTitle}>
                Room Not Found 😔
              </motion.h1>
              <motion.p className={roomStyles.errorSubtext}>
                This room might have ended or the link is incorrect.
              </motion.p>
              <motion.div>
                <Link href="/app">
                  <motion.button
                    className={styles.primaryButton}
                    {...scaleOnHover}
                  >
                    Back to Home
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{room.name} - Blubb.</title>
        <meta
          name="description"
          content={room.description || "Join this audio room conversation"}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <Header user={user} />
        <section className={roomStyles.hero}>
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className={roomStyles.roomContainer}
          >
            {/* Back Button */}
            {/* <button 
              className={roomStyles.backButton}
              onClick={goBack}
            >
              <ArrowLeft size={20} />
            </button> */}

            {/* Room Header */}
            <div className={roomStyles.roomHeader}>
              <h1 className={roomStyles.roomTitle}>{room.name}</h1>
              <p className={roomStyles.roomDescription}>{room.description}</p>
            </div>

            {/* Host Section */}
            <div className={roomStyles.hostSection}>
              <img
                src={user.image}
                alt={room.creator}
                className={roomStyles.hostAvatar}
              />
              <div className={roomStyles.hostName}>{room.creator}</div>
              <div className={roomStyles.hostRole}>Host</div>
            </div>

            {/* Participants */}
            <div className={roomStyles.participantSection}>
              <div className={roomStyles.participantAvatars}>
                {participants.map((participant) => (
                  <img
                    key={participant.id}
                    src={participant.image}
                    alt={participant.name}
                    className={roomStyles.participantAvatar}
                    title={participant.name}
                  />
                ))}
              </div>
            </div>

            {/* Room Stats */}
            <div className={roomStyles.roomStats}>
              <div className={roomStyles.statItem}>
                <span className={roomStyles.statLabel}>Active Hours</span>
                <span className={roomStyles.statValue}>{room.activeHours}</span>
              </div>
              <div className={roomStyles.statItem}>
                <span className={roomStyles.statLabel}>Online Users</span>
                <span className={roomStyles.statValue}>
                  {room.onlineUsers} users
                </span>
              </div>
            </div>

            {/* Share Room */}
            <div className={roomStyles.shareSection}>
              <label className={roomStyles.shareLabel}>Invite Others</label>
              <div className={roomStyles.shareContainer}>
                <input
                  type="text"
                  value={room.url}
                  readOnly
                  className={roomStyles.shareInput}
                />
                <motion.button
                  onClick={copyRoomUrl}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${roomStyles.copyButton} ${
                    copiedUrl ? roomStyles.copied : roomStyles.normal
                  }`}
                >
                  {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
                  {copiedUrl ? "Copied!" : "Copy"}
                </motion.button>
              </div>
            </div>

            {/* Status */}
            <div className={roomStyles.roomStatus}>
              <p className={roomStyles.statusText}>
                You're now in the room! Audio chat is{" "}
                {isMuted ? "muted" : "active"}.
                {!isMuted && " Others can hear you speak."}
              </p>
              <div className={roomStyles.tipCard}>
                💡 Tip: Share the room link with friends to invite them to join
                the conversation!
              </div>
            </div>
          </motion.div>
        </section>
        {/* Audio Controls */}
        <div className={roomStyles.controlsbottm}>
          <div className={roomStyles.audioControls}>
          <motion.button
            className={roomStyles.moreButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Volume2 size={24} />
          </motion.button>

          <motion.button
            onClick={toggleMute}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${roomStyles.micButton} ${
              isMuted ? roomStyles.muted : roomStyles.unmuted
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </motion.button>

          <motion.button
            className={roomStyles.moreButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MoreHorizontal size={24} />
          </motion.button>
        </div>
        </div>
      </div>
    </>
  );
}
