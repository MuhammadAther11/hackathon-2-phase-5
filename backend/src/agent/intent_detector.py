"""
Intent detection logic using pattern matching and OpenAI completion.
"""

import re
from typing import Dict, Any, Tuple, Optional
import logging

from .schemas import IntentType

logger = logging.getLogger(__name__)


class IntentDetector:
    """Detects user intent from natural language messages."""

    # Intent patterns (simple keyword matching as fallback)
    PATTERNS = {
        IntentType.CREATE_TASK: [
            r"\b(create|add|new|make)\s+(a\s+)?(task|todo|item)",
            r"\bremind me to\b",
            r"\bi need to\b",
            r"^(create|add|new)\b",
        ],
        IntentType.LIST_TASKS: [
            r"\b(show|list|display|get|view)\s+(my\s+)?(tasks?|todos?|items?)",
            r"\b(show|display)\s+(my\s+)?(pending|completed|all)",
            r"\bwhat('?s|\s+is)\s+(on\s+)?my\s+(list|todo|tasks?)",
            r"\bshow\s+me\s+(everything|all)",
            r"^(list|show)\b",
        ],
        IntentType.COMPLETE_TASK: [
            r"\b(complete|finish|done|mark)\s+(task|todo|item)?",
            r"\bmark\s+.+\s+as\s+(complete|done)",
            r"\bi('ve|\s+have)\s+(finished|completed|done)",
        ],
        IntentType.UPDATE_TASK: [
            r"\b(update|edit|change|modify)\s+(task|todo|item|my)",
            r"\b(edit|update)\s+(my\s+)?(first|second|third|\d+)",
            r"\brename\s+(task|todo|item)",
            r"\bchange\s+.+\s+to\b",
            r"\b(update|edit|change)\s+.+\s+(?:to|with)\b",
        ],
        IntentType.DELETE_TASK: [
            r"\b(delete|remove|cancel)\s+(task|todo|item|my|the)",
            r"\b(remove|delete)\s+(my\s+)?(first|second|third|\d+)",
            r"\bget\s+rid\s+of\b",
            r"\bdelete\b",
        ],
        IntentType.SET_REMINDER: [
            r"\bremind\s+me\b",
            r"\bset\s+(a\s+)?reminder\b",
            r"\bnotify\s+me\b",
            r"\balert\s+me\b",
            r"\bremember\s+to\b",
        ],
        IntentType.VIEW_REMINDERS: [
            r"\b(show|list|see|view)\s+(reminders?|due\s+(tasks?|items?))",
            r"\bwhat('?s|\s+is)\s+(due|reminders?)",
            r"\bupcoming\s+(tasks?|reminders?)",
            r"\btasks?\s+with\s+due\b",
            r"\bdue\s+tasks?\b",
        ],
        IntentType.SET_PRIORITY: [
            r"\bset\s+.{0,30}priority\b",
            r"\b(make it|mark as)\s+(critical|high|medium|low)",
            r"\bpriority\s+(to\s+)?(1|2|3|4|low|medium|high|critical)",
            r"\bchange\s+.{0,20}priority\b",
        ],
        IntentType.SET_DUE_DATE: [
            r"\bset\s+.{0,30}due\s+date\b",
            r"\bdue\s+date\s+(is|on|to|=)\b",
            r"\bdeadline\s+(is|on|to)\b",
            r"\bschedule\s+(for|on)\b",
        ],
        IntentType.SET_RECURRING: [
            r"\b(recurring|repeat|every|daily|weekly|monthly)\b",
            r"\b(set|make)\s+(it\s+)?(recurring|repeat)",
            r"\b(repeats?|occurs?)\s+(every|each)\b",
        ],
        IntentType.ADD_TAGS: [
            r"\badd\s+tags?\b",
            r"\btags?\s+to\s+(task|todo)\b",
            r"\b(tag|label)\s+(task|todo|item)\b",
            r"\bcategorize\b",
        ],
        IntentType.GREETING: [
            r"^(hi|hello|hey|greetings)\b",
            r"\bhow\s+are\s+you",
        ],
    }

    @staticmethod
    def detect_intent(message: str) -> Tuple[IntentType, float, Dict[str, Any]]:
        """
        Detect intent from user message using pattern matching.

        Args:
            message: User's natural language message

        Returns:
            (intent_type, confidence_score, extracted_parameters)
        """
        message_lower = message.lower().strip()

        # Check greeting first
        if IntentDetector._match_patterns(message_lower, IntentType.GREETING):
            return (IntentType.GREETING, 0.95, {})

        # Check intents in priority order — specific intents before generic ones
        # so "add tags to task 1" doesn't get caught by CREATE_TASK first.
        PRIORITY_ORDER = [
            IntentType.SET_RECURRING,
            IntentType.ADD_TAGS,
            IntentType.SET_PRIORITY,
            IntentType.SET_DUE_DATE,
            IntentType.SET_REMINDER,
            IntentType.VIEW_REMINDERS,
            IntentType.VIEW_TAGS,
            IntentType.COMPLETE_TASK,
            IntentType.DELETE_TASK,
            IntentType.UPDATE_TASK,
            IntentType.LIST_TASKS,
            IntentType.CREATE_TASK,
            IntentType.UNKNOWN,
        ]

        for intent in PRIORITY_ORDER:
            if intent == IntentType.UNKNOWN:
                continue
            if IntentDetector._match_patterns(message_lower, intent):
                params = IntentDetector._extract_parameters(message, intent)
                confidence = 0.8 if params else 0.7
                return (intent, confidence, params)

        # No clear intent detected
        logger.warning(f"[intent_detector] unclear_intent message='{message[:50]}'")
        return (IntentType.UNKNOWN, 0.3, {})

    @staticmethod
    def _match_patterns(message: str, intent: IntentType) -> bool:
        """Check if message matches any pattern for given intent."""
        patterns = IntentDetector.PATTERNS.get(intent, [])
        for pattern in patterns:
            if re.search(pattern, message, re.IGNORECASE):
                return True
        return False

    @staticmethod
    def _extract_parameters(message: str, intent: IntentType) -> Dict[str, Any]:
        """
        Extract parameters from message based on intent.

        Simple extraction for now - can be enhanced with NER.
        """
        params = {}

        if intent == IntentType.CREATE_TASK:
            # 2. Extract priority FIRST so we can clean it from the title
            priority_match = re.search(
                r"\b(?:"
                r"(critical|urgent|asap|important|high|medium|normal|low)\s+priority"
                r"|priority\s*(?:to\s*|[:\-]\s*)?(critical|urgent|asap|important|high|medium|normal|low)"
                r"|(critical|asap)\s+task\b"
                r"|with\s+(critical|urgent|high|medium|normal|low)\b"
                r")",
                message,
                re.IGNORECASE
            )
            if priority_match:
                raw = next(g for g in priority_match.groups() if g)
                params["priority"] = IntentDetector._parse_priority(raw)
                # Remove the priority phrase from message before extracting title
                clean_message = message[:priority_match.start()] + message[priority_match.end():]
                clean_message = re.sub(r"\s{2,}", " ", clean_message).strip()
            else:
                clean_message = message

            # 1. Extract title from the cleaned message (priority removed)
            match = re.search(
                r"(?:create|add|new|make)\s+(?:a\s+)?task\s+(.+?)(?:\s+with\s|\s+due\s+|\s+tags?\s+|\s+for\s+|$)",
                clean_message,
                re.IGNORECASE
            )
            if match:
                title = match.group(1).strip()
                params["title"] = title if title else clean_message.strip()
            else:
                match = re.search(r"(?:create|add|new|make)\s+(?:a\s+)?task\s+(.+)", clean_message, re.IGNORECASE)
                if match:
                    params["title"] = match.group(1).strip()
                else:
                    # Fallback: strip the trigger verb and use the rest
                    stripped = re.sub(r"^(?:create|add|new|make)\s+(?:a\s+)?(?:task\s+)?", "", clean_message, flags=re.IGNORECASE).strip()
                    params["title"] = stripped if stripped else clean_message.strip()
            
            # 3. Extract due date
            due_date = IntentDetector._extract_due_date(message)
            if due_date:
                params["due_date"] = due_date
            
            # 4. Extract tags - look for "tags X,Y,Z" pattern
            tags_match = re.search(r"\btags?\s*[:\(]?\s*([a-zA-Z][a-zA-Z0-9\s,]*)\b", message, re.IGNORECASE)
            if tags_match:
                tag_str = tags_match.group(1)
                params["tags"] = [t.strip() for t in tag_str.split(",") if t.strip() and t.strip().lower() not in ["priority", "due", "date"]]

        elif intent == IntentType.LIST_TASKS:
            # Check for status filter
            if re.search(r"\b(pending|incomplete|open)\b", message, re.IGNORECASE):
                params["status"] = "pending"
            elif re.search(r"\b(completed|done|finished)\b", message, re.IGNORECASE):
                params["status"] = "completed"
            else:
                params["status"] = "all"

        elif intent in [IntentType.COMPLETE_TASK, IntentType.UPDATE_TASK, IntentType.DELETE_TASK]:
            # Try to extract task identifier (number, title fragment, or ID)
            # Look for numbers (task index) - supports #1, 1, etc.
            numbers = re.findall(r"#?(\d+)", message)
            if numbers:
                params["task_index"] = int(numbers[0])

            # Look for quoted text or text after "task"
            quote_match = re.search(r'["\'](.+?)["\']', message)
            if quote_match:
                params["task_identifier"] = quote_match.group(1)
            else:
                # Extract text after task/todo/item, stopping at update delimiters
                match = re.search(
                    r"(?:task|todo|item)\s+(.+?)(?:\s+(?:as|to|with)\b|$)",
                    message,
                    re.IGNORECASE
                )
                if match:
                    # Don't use raw number as identifier if we already have task_index
                    ident = match.group(1).strip().lstrip("#")
                    if not (ident.isdigit() and "task_index" in params):
                        params["task_identifier"] = match.group(1).strip()

            # For update, extract new title after "to", "with", or "as"
            if intent == IntentType.UPDATE_TASK:
                match = re.search(r"\b(?:to|with)\s+(.+)$", message, re.IGNORECASE)
                if match:
                    new_title = match.group(1).strip()
                    # Strip leading "task" if user wrote "with task buy milk"
                    new_title = re.sub(r"^task\s+", "", new_title, flags=re.IGNORECASE)
                    if new_title:
                        params["new_title"] = new_title

        elif intent == IntentType.SET_PRIORITY:
            # Extract priority level — supports "priority to high", "priority: high", etc.
            priority_match = re.search(
                r"\bpriority\s*(?:to\s*|[:\-]\s*)?(critical|urgent|asap|important|high|medium|normal|low|1|2|3|4)\b"
                r"|\b(make\s+it|mark\s+as)\s+(critical|high|medium|low)\b",
                message, re.IGNORECASE
            )
            if priority_match:
                raw_pri = priority_match.group(1) or priority_match.group(3)
                if raw_pri:
                    params["priority"] = IntentDetector._parse_priority(raw_pri)
            # Extract task identifier
            numbers = re.findall(r"#?(\d+)", message)
            if numbers:
                params["task_index"] = int(numbers[0])
            # Look for task title
            quote_match = re.search(r'["\'](.+?)["\']', message)
            if quote_match:
                params["task_identifier"] = quote_match.group(1)

        elif intent == IntentType.SET_DUE_DATE:
            # Extract due date
            due_date = IntentDetector._extract_due_date(message)
            if due_date:
                params["due_date"] = due_date
            # Extract task identifier
            numbers = re.findall(r"#?(\d+)", message)
            if numbers:
                params["task_index"] = int(numbers[0])
            quote_match = re.search(r'["\'](.+?)["\']', message)
            if quote_match:
                params["task_identifier"] = quote_match.group(1)

        elif intent == IntentType.SET_REMINDER:
            # Extract reminder time
            reminder_time = IntentDetector._extract_due_date(message)
            if reminder_time:
                params["reminder_time"] = reminder_time
            # Extract reminder message/task
            match = re.search(r"\b(?:remind me to|remind me about|reminder for)\s+(.+)", message, re.IGNORECASE)
            if match:
                params["reminder_message"] = match.group(1).strip()
            # Extract task identifier
            numbers = re.findall(r"#?(\d+)", message)
            if numbers:
                params["task_index"] = int(numbers[0])

        elif intent == IntentType.SET_RECURRING:
            # Extract recurrence pattern
            recurrence = IntentDetector._extract_recurrence_pattern(message)
            if recurrence:
                params["recurrence_rule"] = recurrence
            # Extract task identifier
            numbers = re.findall(r"#?(\d+)", message)
            if numbers:
                params["task_index"] = int(numbers[0])
            quote_match = re.search(r'["\'](.+?)["\']', message)
            if quote_match:
                params["task_identifier"] = quote_match.group(1)

        elif intent == IntentType.ADD_TAGS:
            # Extract tag names: "add tags X Y Z to task N" or "add tags X, Y, Z"
            # Stop at "to task", "to todo", or end of string
            tags_match = re.search(
                r"\badd\s+tags?\s+(.+?)(?:\s+to\s+(?:task|todo|item)\b|$)",
                message, re.IGNORECASE
            )
            if not tags_match:
                tags_match = re.search(r"\btags?\s*[:\(]?\s*(.+?)(?:\s+to\s+(?:task|todo|item)\b|$)", message, re.IGNORECASE)
            if tags_match:
                raw = tags_match.group(1).strip()
                # Split by comma or space, filter stopwords
                stopwords = {'to', 'task', 'the', 'a', 'an', 'and', 'for', 'with', 'on', 'at'}
                if ',' in raw:
                    params["tags"] = [t.strip() for t in raw.split(',') if t.strip()]
                else:
                    params["tags"] = [w for w in raw.split() if w.lower() not in stopwords]
            # Extract task identifier
            numbers = re.findall(r"#?(\d+)", message)
            if numbers:
                params["task_index"] = int(numbers[0])
            quote_match = re.search(r'["\'](.+?)["\']', message)
            if quote_match:
                params["task_identifier"] = quote_match.group(1)

        return params

    @staticmethod
    def _parse_priority(priority_str: str) -> int:
        """Parse priority string to integer (1=Low, 2=Medium, 3=High, 4=Critical)."""
        priority_map = {
            "low": 1, "1": 1,
            "medium": 2, "2": 2, "normal": 2,
            "high": 3, "3": 3, "urgent": 3, "important": 3,
            "critical": 4, "4": 4, "emergency": 4, "asap": 4,
        }
        return priority_map.get(priority_str.lower(), 2)

    @staticmethod
    def _extract_due_date(message: str) -> Optional[str]:
        """Extract due date from natural language."""
        message_lower = message.lower()
        
        # Today
        if re.search(r"\btoday\b", message_lower):
            return "today"
        
        # Tomorrow
        if re.search(r"\btomorrow\b", message_lower):
            return "tomorrow"
        
        # Next week
        if re.search(r"\bnext\s+week\b", message_lower):
            return "next_week"
        
        # Next month
        if re.search(r"\bnext\s+month\b", message_lower):
            return "next_month"
        
        # Weekend
        if re.search(r"\b(weekend|saturday|sunday)\b", message_lower):
            return "weekend"
        
        # Specific date patterns (MM/DD, DD/MM, etc.)
        date_match = re.search(r"\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b", message_lower)
        if date_match:
            return f"{date_match.group(1)}/{date_match.group(2)}"
        
        return None

    @staticmethod
    def _extract_recurrence_pattern(message: str) -> Optional[Dict[str, Any]]:
        """Extract recurrence pattern from natural language."""
        message_lower = message.lower()
        
        # Daily
        if re.search(r"\bdaily\b|\bevery\s+day\b", message_lower):
            return {"frequency": "daily", "interval": 1}
        
        # Weekly
        if re.search(r"\bweekly\b|\bevery\s+week\b", message_lower):
            return {"frequency": "weekly", "interval": 1}
        
        # Monthly
        if re.search(r"\bmonthly\b|\bevery\s+month\b", message_lower):
            return {"frequency": "monthly", "interval": 1}
        
        # Every X days/weeks/months
        interval_match = re.search(r"\bevery\s+(\d+)\s+(day|week|month)s?\b", message_lower)
        if interval_match:
            return {
                "frequency": f"{interval_match.group(2)}ly",
                "interval": int(interval_match.group(1))
            }
        
        return None

    @staticmethod
    def requires_confirmation(intent: IntentType) -> bool:
        """Check if intent requires user confirmation before execution."""
        return intent in [
            IntentType.DELETE_TASK,
            IntentType.COMPLETE_TASK,
        ]

    @staticmethod
    def generate_confirmation_text(intent: IntentType, params: Dict[str, Any]) -> str:
        """Generate user-friendly confirmation text."""
        if intent == IntentType.CREATE_TASK:
            title = params.get("title", "unnamed task")
            parts = [f"I'll create a task: '{title}'"]
            
            if params.get("priority"):
                priority_names = {1: "Low", 2: "Medium", 3: "High", 4: "Critical"}
                parts.append(f"with {priority_names.get(params['priority'], 'Medium')} priority")
            
            if params.get("due_date"):
                parts.append(f"due {params['due_date']}")
            
            if params.get("tags"):
                parts.append(f"with tags: {', '.join(params['tags'])}")
            
            return ". ".join(parts) + ". Should I go ahead?"

        elif intent == IntentType.LIST_TASKS:
            status = params.get("status", "all")
            return f"I'll show you {status} tasks."

        elif intent == IntentType.COMPLETE_TASK:
            identifier = params.get("task_identifier", params.get("task_index", "the task"))
            return f"I'll mark '{identifier}' as complete. Should I go ahead?"

        elif intent == IntentType.UPDATE_TASK:
            identifier = params.get("task_identifier", params.get("task_index", "the task"))
            new_title = params.get("new_title", "")
            if new_title:
                return f"I'll update '{identifier}' to '{new_title}'. Should I go ahead?"
            return f"I'll update '{identifier}'. What would you like to change?"

        elif intent == IntentType.DELETE_TASK:
            identifier = params.get("task_identifier", params.get("task_index", "the task"))
            return f"I'll delete '{identifier}'. This cannot be undone. Should I proceed?"

        elif intent == IntentType.SET_PRIORITY:
            identifier = params.get("task_identifier", params.get("task_index", "the task"))
            priority = params.get("priority", 2)
            priority_names = {1: "Low", 2: "Medium", 3: "High", 4: "Critical"}
            return f"I'll set '{identifier}' priority to {priority_names.get(priority, 'Medium')}. Should I go ahead?"

        elif intent == IntentType.SET_DUE_DATE:
            identifier = params.get("task_identifier", params.get("task_index", "the task"))
            due_date = params.get("due_date", "a date")
            return f"I'll set '{identifier}' due date to {due_date}. Should I go ahead?"

        elif intent == IntentType.SET_REMINDER:
            identifier = params.get("task_identifier", params.get("task_index", "the task"))
            reminder_time = params.get("reminder_time", "a time")
            return f"I'll set a reminder for '{identifier}' at {reminder_time}. Should I go ahead?"

        elif intent == IntentType.VIEW_REMINDERS:
            return "I'll show you your upcoming reminders and due tasks."

        elif intent == IntentType.VIEW_TAGS:
            return "I'll show you all your tags."

        elif intent == IntentType.SET_RECURRING:
            identifier = params.get("task_identifier", params.get("task_index", "the task"))
            recurrence = params.get("recurrence_rule", {})
            freq = recurrence.get("frequency", "regular")
            interval = recurrence.get("interval", 1)
            return f"I'll make '{identifier}' repeat {freq}" + (f" every {interval} {freq.rstrip('ly')}s" if interval > 1 else "") + ". Should I go ahead?"

        elif intent == IntentType.ADD_TAGS:
            identifier = params.get("task_identifier", params.get("task_index", "the task"))
            tags = params.get("tags", [])
            if tags:
                return f"I'll add tags {', '.join(tags)} to '{identifier}'. Should I go ahead?"
            return f"I'll help you add tags to '{identifier}'. What tags would you like to add?"

        elif intent == IntentType.GREETING:
            return "Hello! I'm your task assistant. How can I help you today?"

        else:
            return "I'm not sure what you want me to do. Can you rephrase that?"
